import { computed, signal, type ReadonlySignal, type Signal } from '@preact/signals-core';
import { nanoid } from 'nanoid';
import type { AtomicRule, AtomicRuleGroup } from '../dsl/AtomicRule';
import type { FieldDataSource } from '../dsl/FieldDataSource';
import { SchedulerState } from '../dsl/SchedulerState';
import { TransitionEventType } from '../dsl/TransitionEventType';
import { FactorOptionsInferrer } from '../inferrer/FactorOptionsInferrer';
import type { Inferrers } from './AtomicRuleForm';
import { AtomicRuleScheduler } from './AtomicRuleScheduler';
import type { GroupCoordination, WorkspaceCoordination } from './Coordination';
import { createGroupCoordination } from './Coordination';

/**
 * 规则组调度器
 *
 * 管理原子规则集合，并实现规则配置约束：
 * - 特定规则因子仅允许配置一次（通过 usedFactors + factors.disabled 实现）
 * - 原子规则最大数量等同于规则因子的数量（通过 canAddRule 暴露）
 * - 编辑态 / 锁定态状态通过 computed 从 WorkspaceCoordination.editingGroupId 派生
 * - 组内不支持并行编辑，最多 1 个 Rule 处于编辑态；存在编辑中的 Rule 时禁用 addRule
 */
export class AtomicRuleGroupScheduler {
  /** 初始化时传入的规则快照数据（编辑场景），不可变 */
  private readonly snapshots: readonly AtomicRule[];
  /** Group 内部已使用的规则因子名称集合 */
  private readonly usedFactors: ReadonlySignal<string[]>;
  readonly id: string;
  /** 已创建的规则实例列表 */
  readonly rules: Signal<readonly AtomicRuleScheduler[]>;
  /** 当前状态（编辑态 / 锁定态），通过 computed 从 WorkspaceCoordination.editingGroupId 派生 */
  readonly state: ReadonlySignal<SchedulerState>;
  /** 是否处于编辑态（派生信号） */
  readonly editable: ReadonlySignal<boolean>;

  /**
   * Group 级协调实体（Group → Rule 协议）
   *
   * 封装供子级 Rule 派生状态的共享信号：
   * - coordination.editingRuleId：当前处于编辑态的 Rule ID（null 表示无编辑中的 Rule）
   * - coordination.factors：可用规则因子集合（组内已用因子标记 disabled）
   * - coordination.bus：Rule 上行事件总线（OK | EDIT | CANCEL）
   */
  readonly coordination: GroupCoordination;

  /** 是否可继续添加原子规则 */
  readonly canAddRule: ReadonlySignal<boolean>;

  private readonly factorOptionsInferrer = new FactorOptionsInferrer();
  private readonly inferrers: Inferrers;
  private readonly workspaceCoordination: WorkspaceCoordination;
  private readonly ruleEventUnsubscribers = new Map<string, (() => void)[]>();
  private destroyed = false;

  constructor(
    id: string,
    workspaceCoordination: WorkspaceCoordination,
    inferrers: Inferrers,
    snapshot?: AtomicRuleGroup
  ) {
    this.id = id;
    this.snapshots = snapshot?.rules ?? [];
    this.inferrers = inferrers;
    this.workspaceCoordination = workspaceCoordination;

    // 状态：从 WorkspaceCoordination 的 editingGroupId computed 派生
    this.state = computed<SchedulerState>(() =>
      workspaceCoordination.editingGroupId.value === this.id
        ? SchedulerState.EDITING
        : SchedulerState.LOCKED
    );
    this.editable = computed<boolean>(() => this.state.value === SchedulerState.EDITING);

    // 初始化 rules 信号（空集合）
    this.rules = signal<readonly AtomicRuleScheduler[]>([]);

    // usedFactors 派生自当前 rules 中已确认的因子名称（从 rule 信号取值，而非编辑态表单）
    this.usedFactors = computed<string[]>(() => {
      const names: string[] = [];

      for (const rule of this.rules.value) {
        if (rule.factorName.value !== null) {
          names.push(rule.factorName.value);
        }
      }

      return names;
    });

    // 创建 Group 级协调实体（供 Rule 消费），factors 通过 Signal 共享
    this.coordination = createGroupCoordination(
      // factors 派生自 allFactors 和 usedFactors
      computed<readonly FieldDataSource[]>(() =>
        this.factorOptionsInferrer.infer(
          workspaceCoordination.allFactors.value,
          this.usedFactors.value
        )
      )
    );

    // 从 snapshot 构造初始 rule scheduler
    for (const rule of snapshot?.rules ?? []) {
      this.hydrateRule(rule);
    }

    // canAddRule：数量约束 + 编辑互斥约束
    this.canAddRule = computed<boolean>(
      () =>
        this.rules.value.length < workspaceCoordination.allFactors.value.length &&
        this.coordination.editingRuleId.value === null
    );
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
    const scheduler = new AtomicRuleScheduler(newId, this.coordination, this.inferrers);
    // 新建的 Rule 自动进入编辑态（互斥：前一个编辑中的 Rule 自动锁定）
    this.coordination.editingRuleId.value = newId;
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
    if (this.coordination.editingRuleId.value === ruleId) {
      this.coordination.editingRuleId.value = null;
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
    const scheduler = new AtomicRuleScheduler(rule.id, this.coordination, this.inferrers, rule);
    this.subscribeRuleEvents(scheduler);
    this.rules.value = [...this.rules.value, scheduler];
  }

  /**
   * 切换指定规则的状态（内部更新 GroupCoordination.editingRuleId Signal）
   */
  transitionState(ruleId: string, state: SchedulerState): boolean {
    if (this.destroyed) return false;
    if (state === SchedulerState.EDITING) {
      // 互斥：更新 editingRuleId，前一个编辑中的 Rule 通过 computed 自动锁定
      this.coordination.editingRuleId.value = ruleId;
      return true;
    } else {
      // LOCKED
      this.coordination.editingRuleId.value = null;
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
   * 内部判断规则组配置是否满足约束，然后发射 OK 事件（上行到 Workspace 的 bus）
   */
  onOk = (): void => {
    if (this.destroyed) return;
    if (!this.validate()) return;
    this.workspaceCoordination.bus.emit(TransitionEventType.OK, {
      type: TransitionEventType.OK,
      sourceId: this.id,
    });
  };

  /**
   * 激活配置编辑（用户行为驱动）
   *
   * 发射 EDIT 事件（上行到 Workspace 的 bus）
   */
  onEdit = (): void => {
    if (this.destroyed) return;
    this.workspaceCoordination.bus.emit(TransitionEventType.EDIT, {
      type: TransitionEventType.EDIT,
      sourceId: this.id,
    });
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

  /** 订阅 Rule 事件（通过 GroupCoordination.bus，需 sourceId 过滤） */
  private subscribeRuleEvents(scheduler: AtomicRuleScheduler): void {
    const unsubs: (() => void)[] = [];

    unsubs.push(
      this.coordination.bus.on(TransitionEventType.OK, (e) => {
        if (e.sourceId !== scheduler.id) return;
        this.coordination.editingRuleId.value = null;
      })
    );

    unsubs.push(
      this.coordination.bus.on(TransitionEventType.EDIT, (e) => {
        if (e.sourceId !== scheduler.id) return;
        this.coordination.editingRuleId.value = scheduler.id;
      })
    );

    unsubs.push(
      this.coordination.bus.on(TransitionEventType.CANCEL, (e) => {
        if (e.sourceId !== scheduler.id) return;
        this.coordination.editingRuleId.value = null;
      })
    );

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
