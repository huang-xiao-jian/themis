import { type RuleFactorDefinition } from '../dsl';
/**
 * Infer the rule factor definition by name.
 *
 * For convenience, the first argument of infer method can be null or undefined.
 */
export declare class FactorInferrer {
  private readonly factorMap;
  constructor(factors: readonly RuleFactorDefinition[]);
  infer(name: string | null | undefined): RuleFactorDefinition | undefined;
}
