import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition'
import type { FieldDataSource } from '../dsl/FieldDataSource'

/**
 * 规则因子选项推断器
 *
 * - 排除已使用的规则因子
 * - 输出 FieldDataSource[] 供 Select 组件消费
 */
export class FactorOptionsInferrer {
  infer(
    allFactors: readonly RuleFactorDefinition[],
    usedFactorNames: ReadonlySet<string>
  ): readonly FieldDataSource[] {
    return allFactors
      .filter((f) => !usedFactorNames.has(f.name))
      .map((f) => ({ label: f.title, value: f.name }))
  }
}
