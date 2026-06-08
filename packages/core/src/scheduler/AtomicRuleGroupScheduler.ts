import { computed, signal, type ReadonlySignal, type Signal } from '@preact/signals-core';
import { nanoid } from 'nanoid';
import type { AtomicRule, AtomicRuleGroup } from '../dsl/AtomicRule';
import type { FieldDataSource } from '../dsl/FieldDataSource';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import { SchedulerState } from '../dsl/SchedulerState';
import { TransitionEventType } from '../dsl/TransitionEventType';
import { FactorOptionsInferrer } from '../inferrer/FactorOptionsInferrer';
import type { Inferrers } from './AtomicRuleForm';
import { AtomicRuleScheduler } from './AtomicRuleScheduler';
import {
  createTransitionEventEmitter,
  type TransitionEventEmitter,
} from './TransitionEventEmitter';

/**
 * 规则组调度器
 *
 * 管理原子规则集合，并实现规则配置约束：
 * - 特定规则因子仅允许配置一次（通过 usedFactors + factors.disabled 实现）
 * - 原子规则最大数量等同于规则因子的数量（通过 canAddRule 暴露）
 * - 编辑态 / 锁定态状态通过 computed 从 Workspace 的 editingGroupId 派生
 * - 组内不支持并行编辑，最多 1 个 Rule 处于编辑态；存在编辑中的 Rule 时禁用 addRule
 */
export class AtomicRuleGroupScheduler {
  readonly id: string;
  /** 初始化时传入的规则快照数据（编辑场景），不可变 */
  readonly snapshots: readonly AtomicRule[];
  /** 已创建的规则实例列表 */
  readonly rules: Signal<readonly AtomicRuleScheduler[]>;
  /** 可用的规则因子列表（Workspace 级共享 Signal） */
  readonly allFactors: ReadonlySignal<readonly RuleFactorDefinition[]>;
  /** Group 内部已使用的规则因子名称集合 */
  readonly usedFactors: ReadonlySignal<string[]>;
  /** 适配选择器的规则因子选项集合，已使用的规则因子标记 disabled */
  readonly factors: ReadonlySignal<readonly FieldDataSource[]>;

  /** 当前状态（编辑态 / 锁定态），通过 computed 从 Workspace 的 editingGroupId 派生 */
  readonly state: ReadonlySignal<SchedulerState>;
  /** 是否处于编辑态（派生信号） */
  readonly editable: ReadonlySignal<boolean>;

  /**
   * Group 级别共享状态：当前处于编辑态的 Rule ID
   *
   * null 表示当前无编辑中的 Rule。
   * AtomicRuleScheduler.state 通过 computed 从此 Signal 派生
   */
  readonly editingRuleId: Signal<string | null>;

  /** 是否可继续添加原子规则 */
  readonly canAddRule: ReadonlySignal<boolean>;

  private readonly factorOptionsInferrer = new FactorOptionsInferrer();
  private readonly inferrers: Inferrers;
  private readonly emitter: TransitionEventEmitter<string>;
  private readonly ruleEventUnsubscribers = new Map<string, (() => void)[]>();
  private destroyed = false;

  constructor(
    id: string,
    editingGroupId: Signal<string | null>,
    factors: Signal<readonly RuleFactorDefinition[]>,
    inferrers: Inferrers,
    snapshot?: AtomicRuleGroup
  ) {
    this.id = id;
    this.snapshots = snapshot?.rules ?? [];
    this.allFactors = factors;
    this.inferrers = inferrers;
    this.emitter = createTransitionEventEmitter<string>();

    // 状态：从 Workspace 的 editingGroupId computed 派生
    this.state = computed<SchedulerState>(() =>
      editingGroupId.value === this.id ? SchedulerState.EDITING : SchedulerState.LOCKED
    );
    this.editable = computed<boolean>(() => this.state.value === SchedulerState.EDITING);

    // Group 级共享 Signal
    this.editingRuleId = signal<string | null>(null);

    // 从 snapshot 构造初始 rule scheduler
    this.rules = signal<readonly AtomicRuleScheduler[]>([]);
    for (const rule of snapshot?.rules ?? []) {
      this.hydrateRule(rule);
    }

    // usedFactors 派生自当前 rules 中已选择的因子名称
    this.usedFactors = computed<string[]>(() => {
      const names: string[] = [];
      for (const rule of this.rules.value) {
        const nameValue = rule.form.values.name as string | null;
        if (nameValue != null) {
          names.push(nameValue);
        }
      }
      return names;
    });

    // factors 派生自 allFactors 和 usedFactors
    this.factors = computed<readonly FieldDataSource[]>(() => {
      return this.factorOptionsInferrer.infer(this.allFactors.value, this.usedFactors.value);
    });

    // canAddRule：数量约束 + 编辑互斥约束
    this.canAddRule = computed<boolean>(
      () =>
        this.rules.value.length < this.allFactors.value.length && this.editingRuleId.value === null
    );
  }

  /** 事件发射器（供父级 Workspace 订阅） */
  get transitionEvents(): TransitionEventEmitter<string> {
    return this.emitter;
  }

  /**
   * 创建原子规则调度器（新建场景）
   *
   * 仅 Group 处于编辑态时允许调用；新建的 Rule 默认进入编辑态
   */
  addRule(): AtomicRuleScheduler | undefined {
    if (this.destroyed) {
      throw new Error(`[sisyphus] AtomicRuleGroupScheduler "${this.id}" is destroyed.`);
    }
    if (this.state.value !== SchedulerState.EDITING || !this.canAddRule.value) {
      return undefined;
    }
    const newId = nanoid();
    const scheduler = new AtomicRuleScheduler(
      newId,
      this.editingRuleId,
      this.allFactors,
      this.inferrers
    );
    // 新建的 Rule 自动进入编辑态（互斥：前一个编辑中的 Rule 自动锁定）
    this.editingRuleId.value = newId;
    this.subscribeRuleEvents(scheduler);
    this.rules.value = [...this.rules.value, scheduler];
    return scheduler;
  }

  /**
   * 获取原子规则调度器
   */
  pickRule(ruleId: string): AtomicRuleScheduler | undefined {
    return this.rules.value.find((r) => r.id === ruleId);
  }

  /**
   * 移除原子规则
   *
   * 删除操作不受锁定态限制，任何状态下均可执行
   */
  removeRule(ruleId: string): void {
    if (this.destroyed) return;
    const next: AtomicRuleScheduler[] = [];
    for (const r of this.rules.value) {
      if (r.id === ruleId) {
        this.unsubscribeRuleEvents(ruleId);
        r.destroy();
      } else {
        next.push(r);
      }
    }
    this.rules.value = next;
    // 若删除的是编辑中的 Rule，清空 editingRuleId
    if (this.editingRuleId.value === ruleId) {
      this.editingRuleId.value = null;
    }
  }

  /**
   * 恢复原子规则调度器（编辑场景）
   *
   * 恢复的 Rule 默认进入锁定态
   */
  hydrateRule(rule: AtomicRule): void {
    if (this.destroyed) {
      throw new Error(`[sisyphus] AtomicRuleGroupScheduler "${this.id}" is destroyed.`);
    }
    const scheduler = new AtomicRuleScheduler(
      rule.id,
      this.editingRuleId,
      this.allFactors,
      this.inferrers,
      rule
    );
    this.subscribeRuleEvents(scheduler);
    this.rules.value = [...this.rules.value, scheduler];
  }

  /**
   * 切换指定规则的状态（内部更新 editingRuleId Signal）
   */
  transitionState(ruleId: string, state: SchedulerState): boolean {
    if (this.destroyed) return false;
    if (state === SchedulerState.EDITING) {
      // 互斥：更新 editingRuleId，前一个编辑中的 Rule 通过 computed 自动锁定
      this.editingRuleId.value = ruleId;
      return true;
    } else {
      // LOCKED
      this.editingRuleId.value = null;
      return true;
    }
  }

  /** 验证所有原子规则 */
  validate(): boolean {
    if (this.rules.value.length === 0) return false;
    return this.rules.value.every((r) => r.rule.value !== null);
  }

  /**
   * 构建规则组
   *
   * 业务校验：规则组至少包含 1 条已配置的原子规则
   */
  build(): AtomicRuleGroup {
    if (!this.validate()) {
      throw new Error(
        `[sisyphus] AtomicRuleGroupScheduler "${this.id}" has incomplete rules. ` +
          `All rules must be confirmed via onOk().`
      );
    }
    return {
      id: this.id,
      rules: this.rules.value.map((r) => r.build()),
    };
  }

  /**
   * 确认配置规则（用户行为驱动）
   *
   * 内部判断规则组配置是否满足约束，然后发射 OK 事件
   */
  onOk = (): void => {
    if (this.destroyed) return;
    if (!this.validate()) return;
    this.emitter.emit(TransitionEventType.OK, this.id);
  };

  /**
   * 激活配置编辑（用户行为驱动）
   *
   * 发射 EDIT 事件
   */
  onEdit = (): void => {
    if (this.destroyed) return;
    this.emitter.emit(TransitionEventType.EDIT, this.id);
  };

  /** 销毁并释放所有子 scheduler */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const r of this.rules.value) {
      this.unsubscribeRuleEvents(r.id);
      r.destroy();
    }
    this.rules.value = [];
  }

  /** 订阅 Rule 事件 */
  private subscribeRuleEvents(scheduler: AtomicRuleScheduler): void {
    const unsubs: (() => void)[] = [];

    const onOk = (): void => {
      this.editingRuleId.value = null;
    };
    scheduler.transitionEvents.on(TransitionEventType.OK, onOk);
    unsubs.push(() => scheduler.transitionEvents.off(TransitionEventType.OK, onOk));

    const onEdit = (): void => {
      this.editingRuleId.value = scheduler.id;
    };
    scheduler.transitionEvents.on(TransitionEventType.EDIT, onEdit);
    unsubs.push(() => scheduler.transitionEvents.off(TransitionEventType.EDIT, onEdit));

    const onCancel = (): void => {
      this.editingRuleId.value = null;
    };
    scheduler.transitionEvents.on(TransitionEventType.CANCEL, onCancel);
    unsubs.push(() => scheduler.transitionEvents.off(TransitionEventType.CANCEL, onCancel));

    this.ruleEventUnsubscribers.set(scheduler.id, unsubs);
  }

  /** 取消订阅 Rule 事件 */
  private unsubscribeRuleEvents(ruleId: string): void {
    const unsubs = this.ruleEventUnsubscribers.get(ruleId);
    if (unsubs) {
      for (const fn of unsubs) fn();
      this.ruleEventUnsubscribers.delete(ruleId);
    }
  }
}
