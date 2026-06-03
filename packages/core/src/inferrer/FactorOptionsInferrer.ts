import type { FieldDataSource } from '../dsl/FieldDataSource';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';

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
    return allFactors.map((f) => ({
      label: f.title,
      value: f.name,
      ...(usedFactorNames.has(f.name) ? { disabled: true } : {}),
    }));
  }
}
