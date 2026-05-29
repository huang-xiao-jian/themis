/**
 * 原子规则
 */
export interface AtomicRule<T = unknown> {
  /** 唯一标识 */
  readonly id: string;
  /** 规则因子名称 */
  readonly name: string;
  /** 匹配操作符 */
  readonly operator: string;
  /** 匹配阈值 */
  readonly threshold: T;
}

/**
 * 规则组
 */
export interface RuleGroup {
  /** 规则组名称 */
  readonly name: string;
  /** 原子规则列表 */
  readonly rules: readonly AtomicRule[];
}
