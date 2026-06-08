import { computed, effect, signal, type ReadonlySignal, type Signal } from '@preact/signals-core';
import type { AtomicRule } from '../dsl/AtomicRule';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import { SchedulerState } from '../dsl/SchedulerState';
import { TransitionEventType } from '../dsl/TransitionEventType';
import { createAtomicRuleForm, type AtomicRuleForm, type Inferrers } from './AtomicRuleForm';
import {
  createTransitionEventEmitter,
  type TransitionEventEmitter,
} from './TransitionEventEmitter';

/**
 * 原子规则调度器
 *
 * 自身状态通过 computed 从所属 AtomicRuleGroupScheduler 的共享 Signal 派生，
 * 暴露只读状态信号、Formily 表单委托，以及用户行为接收入口。
 * 内部将调度器状态同步到 Formily Form 的 pattern 属性。
 */
export class AtomicRuleScheduler {
  readonly id: string;
  readonly form: AtomicRuleForm;

  /** 当前状态（编辑态 / 锁定态），通过 computed 从 Group 的 editingRuleId 派生 */
  readonly state: ReadonlySignal<SchedulerState>;
  /** 是否处于编辑态（派生信号，便于视图层绑定） */
  readonly editable: ReadonlySignal<boolean>;
  /** 上次用户确认且数据无误时更新的原子规则配置 */
  readonly rule: Signal<AtomicRule | null>;

  /** 已激活的规则因子定义 */
  readonly factor: ReadonlySignal<RuleFactorDefinition | null>;

  private readonly emitter: TransitionEventEmitter<string>;
  private readonly factors: ReadonlySignal<readonly RuleFactorDefinition[]>;
  private readonly unsubscribers: (() => void)[] = [];
  private destroyed = false;

  constructor(
    id: string,
    editingRuleId: Signal<string | null>,
    factors: ReadonlySignal<readonly RuleFactorDefinition[]>,
    inferrers: Inferrers,
    snapshot?: AtomicRule
  ) {
    this.id = id;
    this.factors = factors;

    // 创建 Formily 表单（effects 驱动推断联动，推断结果留在 form 内部）
    this.form = createAtomicRuleForm({
      factors: factors.value,
      inferrers,
      initialValues: snapshot
        ? { name: snapshot.name, operator: snapshot.operator, threshold: snapshot.threshold }
        : undefined,
    });

    // 状态：从 Group 的 editingRuleId computed 派生
    this.state = computed<SchedulerState>(() =>
      editingRuleId.value === this.id ? SchedulerState.EDITING : SchedulerState.LOCKED
    );
    this.editable = computed<boolean>(() => this.state.value === SchedulerState.EDITING);

    // 已确认数据：与 build() 返回值一致
    this.rule = signal<AtomicRule | null>(snapshot ?? null);

    // factor 从 form name 字段值 + factors 派生
    this.factor = computed<RuleFactorDefinition | null>(() => {
      const nameValue = this.form.values.name as string | null;
      if (!nameValue) return null;
      return this.factors.value.find((f) => f.name === nameValue) ?? null;
    });

    // 事件发射器
    this.emitter = createTransitionEventEmitter<string>();

    // pattern 同步：state → form.pattern
    const unsubEffect = effect(() => {
      this.form.pattern = this.state.value === SchedulerState.EDITING ? 'editable' : 'disabled';
    });
    this.unsubscribers.push(unsubEffect);
  }

  /** 事件发射器（供父级 Group 订阅） */
  get transitionEvents(): TransitionEventEmitter<string> {
    return this.emitter;
  }

  /** 验证配置是否完整可用 */
  validate(): boolean {
    const name = this.form.values.name;
    const operator = this.form.values.operator;
    const threshold = this.form.values.threshold;
    return name != null && operator != null && threshold != null && threshold !== undefined;
  }

  /** 构建原子规则（返回值与 rule.value 始终一致） */
  build(): AtomicRule {
    if (this.rule.value === null) {
      throw new Error(
        `[sisyphus] AtomicRuleScheduler "${this.id}" has no confirmed data. Call onOk() first.`
      );
    }
    return this.rule.value;
  }

  /**
   * 确认规则配置（用户行为驱动）
   *
   * 内部判断表单配置是否满足规则约束，更新内部数据，然后发射 OK 事件
   */
  onOk = (): void => {
    if (this.destroyed) return;
    if (!this.validate()) return;
    this.rule.value = {
      id: this.id,
      name: this.form.values.name as string,
      operator: this.form.values.operator as string,
      threshold: this.form.values.threshold,
    };
    this.emitter.emit(TransitionEventType.OK, this.id);
  };

  /**
   * 激活规则配置编辑（用户行为驱动）
   *
   * 发射 EDIT 事件，父级通过 editingRuleId 控制状态
   */
  onEdit = (): void => {
    if (this.destroyed) return;
    this.emitter.emit(TransitionEventType.EDIT, this.id);
  };

  /**
   * 取消规则配置（用户行为驱动）
   *
   * 无内部逻辑，直接发射 CANCEL 事件
   */
  onCancel = (): void => {
    if (this.destroyed) return;
    this.emitter.emit(TransitionEventType.CANCEL, this.id);
  };

  /** 销毁并释放订阅 */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const fn of this.unsubscribers) {
      fn();
    }
    this.unsubscribers.length = 0;
  }
}
