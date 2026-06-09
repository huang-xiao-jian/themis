# Domain Layer

Encapsulates the core business rules, including rule inference, operator mapping, and threshold-property calculation. It infers available `operators` and `thresholder` values from `RuleFactorDefinition`, and infers selectable rule-factor options at the `AtomicRuleGroup` level.

## Prerequisites

- [Core spec](./spec.md)
- [Rule factor interpreter](../interpreter.md)

## Core Inference Logic

- At the `AtomicRule` level, infer available `operators` and `thresholder` values from `RuleFactorDefinition`. See the inference mechanism in [Rule factor interpreter](../interpreter.md).
- At the `AtomicRuleGroup` level, infer rule-factor options according to the rule-configuration constraints in [Rule factor specification](../spec.md).

> The inferrers are invoked by `AtomicRuleScheduler` inside the `effects` used to create the Formily form. See [Application layer - AtomicRuleForm](./application.md#atomicruleform).

## Inferrer Class Declarations

```ts
/**
 * Rule factor inferrer
 *
 * Looks up the matching rule factor definition by factor name.
 */
class FactorInferrer {
  constructor(factors: readonly RuleFactorDefinition[]);
  infer(name: string | null | undefined): RuleFactorDefinition | undefined;
}

/**
 * Operator inferrer
 *
 * Uses dataType + semantic to determine the "data domain", then combines mode (point / range)
 * and quantity (single / multiple) to determine the "operation domain".
 */
class OperatorInferrer {
  infer(factor: RuleFactorDefinition): readonly FieldDataSource[];
}

/**
 * Threshold renderer property inferrer
 *
 * Infers the intermediate form component and form component properties from RuleFactorDefinition.
 */
class ThresholderInferrer {
  infer(factor: RuleFactorDefinition): ThresholdComponentProperties;
}
```
