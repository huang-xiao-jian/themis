import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
/**
 * 原子规则操作符解析器
 *
 * 根据 RuleFactorDefinition 的 dataType + mode + quantity 解析可用的操作符列表
 */
export declare class AtomicRuleOperatorResolver {
  resolve(factor: RuleFactorDefinition): readonly string[];
  private resolveMode;
  private resolveQuantity;
}
