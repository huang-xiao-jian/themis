import type { FieldDataSource } from '../dsl/FieldDataSource';
import type { RuleFactor } from '../dsl/RuleFactor';

/**
 * 规则因子选项推断器
 *
 * - 排除已使用的规则因子
 * - 输出 FieldDataSource[] 供 Select 组件消费
 */
export class FactorOptionsInferrer {
  infer(
    allFactors: readonly RuleFactor[],
    usedFactorNames: readonly string[]
  ): readonly FieldDataSource[] {
    const usedSet = new Set<string>(usedFactorNames);
    return allFactors.map((f) => ({
      label: f.title,
      value: f.name,
      ...(usedSet.has(f.name) ? { disabled: true } : {}),
    }));
  }
}
