import { type RuleFactorDefinition } from '../dsl';

/**
 * Infer the rule factor definition by name.
 *
 * For convenience, the first argument of infer method can be null or undefined.
 */
export class FactorInferrer {
  private readonly factorMap: Map<string, RuleFactorDefinition>;

  constructor(factors: readonly RuleFactorDefinition[]) {
    this.factorMap = new Map(factors.map((f) => [f.name, f]));
  }

  infer(name: string): RuleFactorDefinition | undefined {
    return this.factorMap.get(name);
  }
}
