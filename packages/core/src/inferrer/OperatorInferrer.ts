import type { FieldDataSource } from '../dsl/FieldDataSource';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import { AtomicRuleOperatorResolver } from './AtomicRuleOperatorResolver';

/**
 * Operator 推断器
 *
 * 根据 RuleFactorDefinition 推断可用的匹配操作符列表
 */
export class OperatorInferrer {
  private readonly resolver = new AtomicRuleOperatorResolver();

  infer(factor: RuleFactorDefinition): readonly FieldDataSource[] {
    const operators = this.resolver.resolve(factor);
    return operators.map((op) => ({ label: op, value: op }));
  }
}
