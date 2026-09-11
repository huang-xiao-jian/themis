import { type ReadonlySignal, type Signal } from '@preact/signals-core';
import type { AtomicRuleGroup } from '../dsl/AtomicRule';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import type { Inferrers } from './AtomicRuleForm';
import { AtomicRuleGroupScheduler } from './AtomicRuleGroupScheduler';
import type { WorkspaceCoordination } from './Coordination';
/**
 * 工作空间调度器
 *
 * 顶层入口：管理所有规则组、共享因素定义、生命周期管理
 * 信号通道（通过 WorkspaceCoordination 封装 allFactors）
 * + 事件总线（订阅 Group 的 WorkspaceCoordinationEvent）
 */
export declare class RuleWorkspaceScheduler {
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
  private readonly inferrers;
  private readonly groupEventUnsubscribers;
  private destroyed;
  constructor(
    factors: readonly RuleFactorDefinition[],
    inferrers: Inferrers,
    snapshots?: readonly AtomicRuleGroup[]
  );
  /**
   * 获取规则因子定义（只读访问）
   */
  getFactors(): ReadonlySignal<readonly RuleFactorDefinition[]>;
  /**
   * 恢复规则组调度器（编辑场景）
   *
   * 恢复的 Group 及其内部 Rule 默认进入锁定态
   */
  hydrateGroup(group: AtomicRuleGroup): void;
  /**
   * 创建规则组调度器（新建场景）
   *
   * 新建的 Group 默认进入锁定态（无编辑状态）
   */
  addGroup(): AtomicRuleGroupScheduler | undefined;
  /**
   * 获取规则组调度器
   */
  pickGroup(groupId: string): AtomicRuleGroupScheduler | undefined;
  /**
   * 移除规则组
   *
   * 删除操作不受锁定态限制，任何状态下均可执行
   */
  removeGroup(groupId: string): void;
  /** 验证所有规则组 */
  validate(): boolean;
  /**
   * 构建所有规则组
   *
   * 业务校验：工作空间至少包含 1 个已配置的规则组
   */
  build(): readonly AtomicRuleGroup[];
  /** 销毁工作空间，释放所有资源 */
  destroy(): void;
  /** 订阅 Group 事件（通过 WorkspaceCoordination.bus，需 sourceId 过滤） */
  private subscribeGroupEvents;
  /** 取消订阅 Group 事件 */
  private unsubscribeGroupEvents;
}
