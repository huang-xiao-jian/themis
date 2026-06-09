import { computed, signal, type ReadonlySignal, type Signal } from '@preact/signals-core';
import { nanoid } from 'nanoid';
import type { AtomicRuleGroup } from '../dsl/AtomicRule';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import { WorkspaceCoordinationEventType } from '../dsl/WorkspaceCoordinationEventType';
import type { Inferrers } from './AtomicRuleForm';
import { AtomicRuleGroupScheduler } from './AtomicRuleGroupScheduler';
import type { WorkspaceCoordination } from './Coordination';
import { createWorkspaceCoordination } from './Coordination';

/**
 * 工作空间调度器
 *
 * 顶层入口：管理所有规则组、共享因素定义、生命周期管理
 * 信号通道（通过 WorkspaceCoordination 封装 allFactors）
 * + 事件总线（订阅 Group 的 WorkspaceCoordinationEvent）
 */
export class RuleWorkspaceScheduler {
  /** 初始化时传入的规则组快照数据（编辑场景），不可变 */
  readonly snapshots: readonly AtomicRuleGroup[];
  /** 已创建的规则组实例列表 */
  readonly groups: Signal<readonly AtomicRuleGroupScheduler[]>;

  /**
   * Workspace 级协调实体（Workspace → Group 协议）
   *
   * 封装供子级 Group 派生状态的共享信号：
   * - coordination.allFactors：可用规则因子定义列表
   * - coordination.bus：Group 上行事件总线（REMOVE）
   */
  readonly coordination: WorkspaceCoordination;

  /** 是否可继续添加规则组 */
  readonly canAddGroup: ReadonlySignal<boolean>;

  private readonly inferrers: Inferrers;
  private readonly groupEventUnsubscribers = new Map<string, (() => void)[]>();
  private destroyed = false;

  constructor(
    factors: readonly RuleFactorDefinition[],
    inferrers: Inferrers,
    snapshots?: readonly AtomicRuleGroup[]
  ) {
    this.snapshots = snapshots ?? [];
    this.inferrers = inferrers;

    // 创建 Workspace 级协调实体
    this.coordination = createWorkspaceCoordination(factors);

    // canAddGroup：无空规则 Group
    this.canAddGroup = computed<boolean>(() => {
      // 存在配置规则为空的 Group 时禁用新增
      return !this.groups.value.some((g) => g.isEmpty());
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
    return this.coordination.allFactors;
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
      this.coordination,
      this.inferrers,
      group
    );
    this.subscribeGroupEvents(scheduler);
    this.groups.value = [...this.groups.value, scheduler];
  }

  /**
   * 创建规则组调度器（新建场景）
   *
   * 新建的 Group 默认进入锁定态（无编辑状态）
   */
  addGroup(): AtomicRuleGroupScheduler | undefined {
    if (this.destroyed) {
      throw new Error('[sisyphus] RuleWorkspaceScheduler is destroyed.');
    }
    if (!this.canAddGroup.value) {
      return undefined;
    }
    const newId = nanoid();
    const scheduler = new AtomicRuleGroupScheduler(newId, this.coordination, this.inferrers);
    // 新建的 Group 默认进入锁定态（无编辑状态）
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

  /** 订阅 Group 事件（通过 WorkspaceCoordination.bus，需 sourceId 过滤） */
  private subscribeGroupEvents(scheduler: AtomicRuleGroupScheduler): void {
    const unsubs: (() => void)[] = [];

    unsubs.push(
      this.coordination.bus.on(WorkspaceCoordinationEventType.REMOVE, (e) => {
        if (e.sourceId !== scheduler.id) return;
        this.removeGroup(scheduler.id);
      })
    );
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
