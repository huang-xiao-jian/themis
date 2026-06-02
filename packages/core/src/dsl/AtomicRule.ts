/**
 * 原子规则
 *
 * 规则配置的最小语义单元，由 匹配目标(name) + 匹配方式(operator) + 匹配阈值(threshold) 组成
 */
export interface AtomicRule<T = unknown> {
  /** 唯一标识 */
  readonly id: string;
  /** 目标数据（规则因子名称） */
  readonly name: string;
  /** 匹配方式 */
  readonly operator: string;
  /** 匹配阈值 */
  readonly threshold: T;
}

/**
 * 规则组
 *
 * 多个原子规则通过 AND 连接形成规则组
 */
export interface AtomicRuleGroup {
  /** 规则组内的原子规则列表 */
  readonly rules: readonly AtomicRule[];
}
