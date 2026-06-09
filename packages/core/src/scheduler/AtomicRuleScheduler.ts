import { computed, effect, signal, type ReadonlySignal, type Signal } from '@preact/signals-core';
import type { AtomicRule } from '../dsl/AtomicRule';
import { SchedulerState } from '../dsl/SchedulerState';
import { TransitionEventType } from '../dsl/TransitionEventType';
import { createAtomicRuleForm, type AtomicRuleForm, type Inferrers } from './AtomicRuleForm';
import type { GroupCoordination } from './Coordination';

type DisposeFn = () => void;

/**
 * 原子规则调度器
 *
 * 自身状态通过 computed 从所属 AtomicRuleGroupScheduler 的 GroupCoordination 派生，
 * 暴露只读状态信号、Formily 表单委托，以及用户行为接收入口。
 * 内部将调度器状态同步到 Formily Form 的 pattern 属性。
 */
export class AtomicRuleScheduler {
  readonly id: string;
  readonly form: AtomicRuleForm;

  /** 当前状态（编辑态 / 锁定态），通过 computed 从 Group 的 GroupCoordination.editingRuleId 派生 */
  readonly state: ReadonlySignal<SchedulerState>;
  /** 是否处于编辑态（派生信号，便于视图层绑定） */
  readonly editable: ReadonlySignal<boolean>;
  /** 上次用户确认且数据无误时更新的原子规则配置 */
  readonly rule: Signal<AtomicRule | null>;
  /** 已确认的原子规则因子名（从 rule 信号 computed 派生） */
  readonly factorName: ReadonlySignal<string | null>;

  /** 规则调度器销毁回调集合 */
  private disposers: DisposeFn[] = [];
  private readonly coordination: GroupCoordination;
  private destroyed = false;

  constructor(
    id: string,
    coordination: GroupCoordination,
    inferrers: Inferrers,
    snapshot?: AtomicRule
  ) {
    this.id = id;
    this.coordination = coordination;

    // 创建 Formily 表单（effects 驱动重置联动，推断由视图层处理）
    this.form = createAtomicRuleForm({
      initialValues: snapshot,
      inferrers,
      coordination,
    });

    // 状态：从 GroupCoordination 的 editingRuleId computed 派生
    this.state = computed<SchedulerState>(() =>
      coordination.editingRuleId.value === this.id ? SchedulerState.EDITING : SchedulerState.LOCKED
    );
    this.editable = computed<boolean>(() => this.state.value === SchedulerState.EDITING);

    // 已确认数据：与 build() 返回值一致
    this.rule = signal<AtomicRule | null>(snapshot ?? null);
    this.factorName = computed<string | null>(() => this.rule.value?.name ?? null);

    // pattern 同步：state → form.pattern
    this.disposers.push(
      effect(() => {
        this.form.pattern = this.state.value === SchedulerState.EDITING ? 'editable' : 'disabled';
      })
    );
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
    this.coordination.bus.emit(TransitionEventType.OK, {
      type: TransitionEventType.OK,
      sourceId: this.id,
    });
  };

  /**
   * 激活规则配置编辑（用户行为驱动）
   *
   * 发射 EDIT 事件，父级通过 GroupCoordination.editingRuleId 控制状态
   */
  onEdit = (): void => {
    if (this.destroyed) return;
    this.coordination.bus.emit(TransitionEventType.EDIT, {
      type: TransitionEventType.EDIT,
      sourceId: this.id,
    });
  };

  /**
   * 取消规则配置（用户行为驱动）
   *
   * 无内部逻辑，直接发射 CANCEL 事件
   */
  onCancel = (): void => {
    if (this.destroyed) return;
    this.coordination.bus.emit(TransitionEventType.CANCEL, {
      type: TransitionEventType.CANCEL,
      sourceId: this.id,
    });
  };

  /** 销毁并释放订阅 */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.disposers.forEach((fn) => fn());
    this.disposers = [];
  }
}
