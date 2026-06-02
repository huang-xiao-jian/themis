import type { FieldDataSource } from '../dsl/FieldDataSource'
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition'
import { resolveOperatorTable } from './operatorMappings'

/**
 * Operator 推断器
 *
 * 根据 RuleFactorDefinition 推断可用的匹配操作符列表
 */
export class OperatorInferrer {
  infer(factor: RuleFactorDefinition): readonly FieldDataSource[] {
    const operators = resolveOperatorTable(factor)
    return operators.map((op) => ({ label: op, value: op }))
  }
}
