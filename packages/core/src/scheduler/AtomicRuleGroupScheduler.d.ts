import { type ReadonlySignal, type Signal } from '@preact/signals-core';
import type { AtomicRule, AtomicRuleGroup } from '../dsl/AtomicRule';
import type { Inferrers } from './AtomicRuleForm';
import { AtomicRuleScheduler } from './AtomicRuleScheduler';
import type { GroupCoordination, WorkspaceCoordination } from './Coordination';
/**
 * 规则组调度器
 *
 * 管理原子规则集合，并实现规则配置约束：
 * - 特定规则因子仅允许配置一次（通过 usedFactors + factors.disabled 实现）
 * - 原子规则最大数量等同于规则因子的数量（通过 canAddRule 暴露）
 * - 组内不支持并行编辑，最多 1 个 Rule 处于编辑态；存在编辑中的 Rule 时禁用 addRule
 */
export declare class AtomicRuleGroupScheduler {
  /** 初始化时传入的规则快照数据（编辑场景），不可变 */
  private readonly snapshots;
  /** Group 内部已使用的规则因子名称集合 */
  private readonly usedFactors;
  /** 规则组调度器销毁回调集合 */
  private disposers;
  /** 规则组唯一标识 */
  readonly id: string;
  /** 已创建的规则实例列表 */
  readonly rules: Signal<readonly AtomicRuleScheduler[]>;
  /** 是否可继续添加原子规则 */
  readonly canAddRule: ReadonlySignal<boolean>;
  /**
   * Group 级协调实体（Group → Rule 协议）
   *
   * 封装供子级 Rule 派生状态的共享信号：
   * - coordination.editingRuleId：当前处于编辑态的 Rule ID（null 表示无编辑中的 Rule）
   * - coordination.factors：可用规则因子集合（组内已用因子标记 disabled）
   * - coordination.bus：Rule 上行事件总线（OK | EDIT | CANCEL | REMOVE）
   */
  readonly coordination: GroupCoordination;
  private readonly factorOptionsInferrer;
  private readonly inferrers;
  private readonly workspaceCoordination;
  private readonly ruleEventUnsubscribers;
  private destroyed;
  constructor(
    id: string,
    workspaceCoordination: WorkspaceCoordination,
    inferrers: Inferrers,
    snapshot?: AtomicRuleGroup
  );
  /**
   * 创建原子规则调度器（新建场景）
   *
   * 新建的 Rule 默认进入编辑态
   */
  addRule(): AtomicRuleScheduler | undefined;
  /**
   * 获取原子规则调度器
   */
  pickRule(ruleId: string): AtomicRuleScheduler | undefined;
  /**
   * 移除原子规则
   *
   * 删除操作不受锁定态限制，任何状态下均可执行
   */
  removeRule(ruleId: string): void;
  /**
   * 恢复原子规则调度器（编辑场景）
   *
   * 恢复的 Rule 默认进入锁定态
   */
  hydrateRule(rule: AtomicRule): void;
  /** 验证所有原子规则 */
  validate(): boolean;
  /**
   * 构建规则组
   *
   * 业务校验：规则组至少包含 1 条已配置的原子规则
   */
  build(): AtomicRuleGroup;
  /**
   * 请求移除自身（用户行为驱动）
   *
   * 发射 REMOVE 事件（上行到 Workspace 的 bus），父级负责实际移除并清理事件订阅
   */
  onRemove: () => void;
  /** 销毁并释放所有子 scheduler */
  destroy(): void;
  isEmpty(): boolean;
  /** 订阅 Rule 事件（通过 GroupCoordination.bus，需 sourceId 过滤） */
  private subscribeRuleEvents;
  /** 取消订阅 Rule 事件 */
  private unsubscribeRuleEvents;
}
