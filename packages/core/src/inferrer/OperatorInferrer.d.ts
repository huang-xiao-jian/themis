import type { FieldDataSource } from '../dsl/FieldDataSource';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
/**
 * Operator 推断器
 *
 * 根据 RuleFactorDefinition 推断可用的匹配操作符列表
 */
export declare class OperatorInferrer {
  private readonly resolver;
  infer(factor: RuleFactorDefinition): readonly FieldDataSource[];
}
