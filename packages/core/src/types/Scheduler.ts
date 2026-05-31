import type { RuleFactorDefinition } from './DSL';
import type { FieldDataSource } from './Fetcher';
import type { ThresholdComponentProperties } from './Inference';
import type { ReadonlySignal } from './Resource';

/**
 * 表单字段标识
 */
export type FieldName = 'name' | 'operator' | 'threshold';

/**
 * 表单字段变更 Action
 */
export interface FieldChangeAction {
  field: FieldName;
  value: unknown;
}

/**
 * 原子规则
 */
export interface AtomicRule {
  /** 规则标识 */
  readonly id: string;
  /** 规则因子名称 */
  readonly name: string;
  /** 操作符 */
  readonly operator: string;
  /** 阈值 */
  readonly threshold: unknown;
}

/**
 * 原子规则初始化数据（编辑场景）
 */
export interface AtomicRuleData {
  /** 规则标识 */
  readonly id: string;
  /** 规则因子名称 */
  readonly name: string;
  /** 操作符 */
  readonly operator: string;
  /** 阈值 */
  readonly threshold: unknown;
}

/**
 * 规则组
 */
export interface AtomicRuleGroup {
  /** 已有的原子规则列表 */
  readonly rules: readonly AtomicRule[];
}

/**
 * 规则组初始化数据（编辑场景）
 */
export interface AtomicRuleGroupData {
  /** 已有的原子规则列表 */
  readonly rules: readonly AtomicRuleData[];
}

/**
 * 原子规则设置器
 */
export interface IAtomicRuleScheduler {
  /** 唯一标识 */
  readonly id: string;
  /** 已激活的规则因子定义 */
  readonly factor: ReadonlySignal<RuleFactorDefinition | null>;
  /** 可用的匹配操作符列表（由推断机制计算） */
  readonly operators: ReadonlySignal<readonly FieldDataSource[]>;
  /** threshold 渲染组件属性（由推断机制计算） */
  readonly thresholder: ReadonlySignal<ThresholdComponentProperties | null>;
  /** 选中的规则因子名称（表单字段，用户行为触发变更） */
  readonly name: ReadonlySignal<string | null>;
  /** 选中的操作符（表单字段，用户行为触发变更） */
  readonly operator: ReadonlySignal<string | null>;
  /** 阈值（表单字段，用户行为触发变更） */
  readonly threshold: ReadonlySignal<unknown>;
  /**
   * 表单字段变更回调（供组件 onChange 绑定，单个方法处理三个字段）
   * - field='name' 时：自动触发 factor 切换、operators 推断、重置 operator/threshold
   * - field='operator' 时：更新操作符
   * - field='threshold' 时：更新阈值
   */
  readonly onFieldChange: (action: FieldChangeAction) => void;
  /** 验证配置是否完整可用 */
  validate(): boolean;
  /** 构建原子规则 */
  build(): AtomicRule;
}

/**
 * 规则组设置器
 */
export interface IAtomicRuleGroupScheduler {
  /** 规则组唯一标识 */
  readonly id: string;
  /** 已配置的原子规则列表，仅在编辑场景 */
  readonly snapshot: readonly AtomicRule[];
  /** 已创建的规则实例列表 */
  readonly rules: ReadonlySignal<readonly IAtomicRuleScheduler[]>;
  /** 可用的规则因子列表 */
  readonly factors: ReadonlySignal<readonly RuleFactorDefinition[]>;
  /** 适配选择器的选项集合，需要排除已使用的规则因子 */
  readonly factorOptions: ReadonlySignal<readonly FieldDataSource[]>;
  /** 创建原子规则设置器（新建场景） */
  addRule(ruleId: string, initialData?: { name: string; operator: string; threshold: unknown }): IAtomicRuleScheduler;
  /** 移除原子规则 */
  removeRule(ruleId: string): void;
  /** 验证所有原子规则 */
  validate(): boolean;
  /** 构建规则组 */
  build(): AtomicRuleGroup;
}

/**
 * 工作空间设置器
 */
export interface IRuleWorkspaceScheduler {
  /** 已创建的规则组列表，仅在编辑场景 */
  readonly snapshot: readonly AtomicRuleGroup[];
  /** 已创建的规则组实例列表 */
  readonly groups: ReadonlySignal<readonly IAtomicRuleGroupScheduler[]>;
  /** 创建规则组设置器（新建场景） */
  addGroup(groupId: string): IAtomicRuleGroupScheduler;
  /** 移除规则组 */
  removeGroup(groupId: string): void;
  /** 验证所有规则组 */
  validate(): boolean;
  /** 构建所有规则组 */
  build(): readonly AtomicRuleGroup[];
}