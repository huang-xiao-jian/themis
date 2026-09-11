import { type ReadonlySignal, type Signal } from '@preact/signals-core';
import type { AtomicRule } from '../dsl/AtomicRule';
import { SchedulerState } from '../dsl/SchedulerState';
import { type AtomicRuleForm, type Inferrers } from './AtomicRuleForm';
import type { GroupCoordination } from './Coordination';
/**
 * 原子规则调度器
 *
 * 自身状态通过 computed 从所属 AtomicRuleGroupScheduler 的 GroupCoordination 派生，
 * 暴露只读状态信号、Formily 表单委托，以及用户行为接收入口。
 *
 * 状态派生规则：
 * - 由 editingRuleId 决定是否可编辑：editingRuleId === this.id → EDITING，否则 → LOCKED
 *
 * 内部将调度器状态同步到 Formily Form 的 pattern 属性。
 */
export declare class AtomicRuleScheduler {
  readonly id: string;
  readonly form: AtomicRuleForm;
  /** 当前状态（编辑态 / 锁定态），通过 computed 从 Group 的 editingRuleId 派生 */
  readonly state: ReadonlySignal<SchedulerState>;
  /** 是否处于编辑态（派生信号，便于视图层绑定） */
  readonly editable: ReadonlySignal<boolean>;
  /** 上次用户确认且数据无误时更新的原子规则配置 */
  readonly rule: Signal<AtomicRule | null>;
  /** 已确认的原子规则因子名（从 rule 信号 computed 派生） */
  readonly factorName: ReadonlySignal<string | null>;
  /** 规则调度器销毁回调集合 */
  private disposers;
  private readonly coordination;
  private destroyed;
  constructor(
    id: string,
    coordination: GroupCoordination,
    inferrers: Inferrers,
    snapshot?: AtomicRule
  );
  /** 验证配置是否完整可用 */
  validate(): boolean;
  /** 构建原子规则（返回值与 rule.value 始终一致） */
  build(): AtomicRule;
  /**
   * 确认规则配置（用户行为驱动）
   *
   * Group 只读时静默忽略；内部判断表单配置是否满足规则约束，更新内部数据，然后发射 OK 事件
   */
  onOk: () => void;
  /**
   * 激活规则配置编辑（用户行为驱动）
   *
   * Group 只读时静默忽略；发射 EDIT 事件，父级通过 GroupCoordination.editingRuleId 控制状态
   */
  onEdit: () => void;
  /**
   * 取消规则配置（用户行为驱动）
   *
   * 无内部逻辑，直接发射 CANCEL 事件
   */
  onCancel: () => void;
  /**
   * 请求移除自身（用户行为驱动）
   *
   * 发射 REMOVE 事件，父级负责实际移除并清理事件订阅
   */
  onRemove: () => void;
  /** 销毁并释放订阅 */
  destroy(): void;
}
