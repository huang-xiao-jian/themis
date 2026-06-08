import { computed, signal, type ReadonlySignal, type Signal } from '@preact/signals-core';
import { nanoid } from 'nanoid';
import type { AtomicRuleGroup } from '../dsl/AtomicRule';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import { SchedulerState } from '../dsl/SchedulerState';
import { TransitionEventType } from '../dsl/TransitionEventType';
import type { Inferrers } from './AtomicRuleForm';
import { AtomicRuleGroupScheduler } from './AtomicRuleGroupScheduler';

/**
 * 工作空间调度器
 *
 * 顶层入口：管理所有规则组、共享因素定义、生命周期管理
 * 信号下行（维护 editingGroupId + allFactors 共享 Signal）+ 事件上行（订阅 Group 的 TransitionEvent）
 */
export class RuleWorkspaceScheduler {
  /** 初始化时传入的规则组快照数据（编辑场景），不可变 */
  readonly snapshots: readonly AtomicRuleGroup[];
  /** 已创建的规则组实例列表 */
  readonly groups: Signal<readonly AtomicRuleGroupScheduler[]>;

  /**
   * Workspace 级别共享状态：当前处于编辑态的 Group ID
   *
   * null 表示当前无编辑中的 Group。
   * AtomicRuleGroupScheduler.state 通过 computed 从此 Signal 派生
   */
  readonly editingGroupId: Signal<string | null>;

  /** 是否可继续添加规则组 */
  readonly canAddGroup: ReadonlySignal<boolean>;

  private readonly factors: Signal<readonly RuleFactorDefinition[]>;
  private readonly inferrers: Inferrers;
  private readonly groupEventUnsubscribers = new Map<string, (() => void)[]>();
  private destroyed = false;

  constructor(
    factors: readonly RuleFactorDefinition[],
    inferrers: Inferrers,
    snapshots?: readonly AtomicRuleGroup[]
  ) {
    this.snapshots = snapshots ?? [];
    this.factors = signal<readonly RuleFactorDefinition[]>([...factors]);
    this.inferrers = inferrers;

    // Workspace 级共享 Signal
    this.editingGroupId = signal<string | null>(null);

    // canAddGroup：无编辑中 Group 且无空规则 Group
    this.canAddGroup = computed<boolean>(() => {
      if (this.editingGroupId.value !== null) return false;
      // 存在配置规则为空的 Group 时禁用新增
      return !this.groups.value.some((g) => g.rules.value.length === 0);
    });

    // 编辑场景：从 snapshots 构造初始 group scheduler
    this.groups = signal<readonly AtomicRuleGroupScheduler[]>([]);
    for (const g of snapshots ?? []) {
      this.hydrateGroup(g);
    }
  }

  /**
   * 获取规则因子定义（只读访问）
   */
  getFactors(): ReadonlySignal<readonly RuleFactorDefinition[]> {
    return this.factors;
  }

  /**
   * 恢复规则组调度器（编辑场景）
   *
   * 恢复的 Group 及其内部 Rule 默认进入锁定态
   */
  hydrateGroup(group: AtomicRuleGroup): void {
    if (this.destroyed) {
      throw new Error('[sisyphus] RuleWorkspaceScheduler is destroyed.');
    }
    const scheduler = new AtomicRuleGroupScheduler(
      group.id,
      this.editingGroupId,
      this.factors,
      this.inferrers,
      group
    );
    this.subscribeGroupEvents(scheduler);
    this.groups.value = [...this.groups.value, scheduler];
  }

  /**
   * 创建规则组调度器（新建场景）
   *
   * 新建的 Group 默认进入编辑态（editingGroupId 更新为新 Group ID）
   */
  addGroup(): AtomicRuleGroupScheduler | undefined {
    if (this.destroyed) {
      throw new Error('[sisyphus] RuleWorkspaceScheduler is destroyed.');
    }
    if (!this.canAddGroup.value) {
      return undefined;
    }
    const newId = nanoid();
    const scheduler = new AtomicRuleGroupScheduler(
      newId,
      this.editingGroupId,
      this.factors,
      this.inferrers
    );
    // 新建的 Group 自动进入编辑态
    this.editingGroupId.value = newId;
    this.subscribeGroupEvents(scheduler);
    this.groups.value = [...this.groups.value, scheduler];
    return scheduler;
  }

  /**
   * 获取规则组调度器
   */
  pickGroup(groupId: string): AtomicRuleGroupScheduler | undefined {
    return this.groups.value.find((g) => g.id === groupId);
  }

  /**
   * 移除规则组
   *
   * 删除操作不受锁定态限制，任何状态下均可执行
   */
  removeGroup(groupId: string): void {
    if (this.destroyed) return;
    const next: AtomicRuleGroupScheduler[] = [];
    for (const g of this.groups.value) {
      if (g.id === groupId) {
        this.unsubscribeGroupEvents(groupId);
        g.destroy();
      } else {
        next.push(g);
      }
    }
    this.groups.value = next;
    // 若删除的是编辑中的 Group，清空 editingGroupId
    if (this.editingGroupId.value === groupId) {
      this.editingGroupId.value = null;
    }
  }

  /**
   * 切换指定规则组的状态（内部更新 editingGroupId Signal）
   *
   * LOCKED 时级联锁定组内所有编辑中的 Rule
   */
  transitionState(groupId: string, state: SchedulerState): boolean {
    if (this.destroyed) return false;
    if (state === SchedulerState.EDITING) {
      this.editingGroupId.value = groupId;
      return true;
    } else {
      // LOCKED：清空 editingGroupId + 级联锁定组内 Rule
      this.editingGroupId.value = null;
      const group = this.pickGroup(groupId);
      if (group) {
        group.transitionState('', SchedulerState.LOCKED); // 清空 editingRuleId
      }
      return true;
    }
  }

  /** 验证所有规则组 */
  validate(): boolean {
    if (this.groups.value.length === 0) return false;
    return this.groups.value.every((g) => g.validate());
  }

  /**
   * 构建所有规则组
   *
   * 业务校验：工作空间至少包含 1 个已配置的规则组
   */
  build(): readonly AtomicRuleGroup[] {
    if (!this.validate()) {
      throw new Error(
        '[sisyphus] RuleWorkspaceScheduler has incomplete groups. ' +
          'All groups must contain confirmed rules.'
      );
    }
    return this.groups.value.map((g) => g.build());
  }

  /** 销毁工作空间，释放所有资源 */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const g of this.groups.value) {
      this.unsubscribeGroupEvents(g.id);
      g.destroy();
    }
    this.groups.value = [];
  }

  /** 订阅 Group 事件 */
  private subscribeGroupEvents(scheduler: AtomicRuleGroupScheduler): void {
    const unsubs: (() => void)[] = [];

    const onOk = (): void => {
      // Group 确认 → 锁定 + 级联锁定组内 Rule
      this.editingGroupId.value = null;
      scheduler.transitionState('', SchedulerState.LOCKED);
    };
    scheduler.transitionEvents.on(TransitionEventType.OK, onOk);
    unsubs.push(() => scheduler.transitionEvents.off(TransitionEventType.OK, onOk));

    const onEdit = (): void => {
      this.editingGroupId.value = scheduler.id;
    };
    scheduler.transitionEvents.on(TransitionEventType.EDIT, onEdit);
    unsubs.push(() => scheduler.transitionEvents.off(TransitionEventType.EDIT, onEdit));

    this.groupEventUnsubscribers.set(scheduler.id, unsubs);
  }

  /** 取消订阅 Group 事件 */
  private unsubscribeGroupEvents(groupId: string): void {
    const unsubs = this.groupEventUnsubscribers.get(groupId);
    if (unsubs) {
      for (const fn of unsubs) fn();
      this.groupEventUnsubscribers.delete(groupId);
    }
  }
}
