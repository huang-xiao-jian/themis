import type { FieldDataSource } from '../dsl/FieldDataSource';
import type { RuleFactor } from '../dsl/RuleFactor';
import { AtomicRuleOperatorResolver } from './AtomicRuleOperatorResolver';

/**
 * Operator 推断器
 *
 * 根据 RuleFactor 推断可用的匹配操作符列表
 */
export class OperatorInferrer {
  private readonly resolver = new AtomicRuleOperatorResolver();

  infer(factor: RuleFactor): readonly FieldDataSource[] {
    const operators = this.resolver.resolve(factor);
    return operators.map((op) => ({ label: op, value: op }));
  }
}
