# Domain Layer

Encapsulates the core business rules, including rule inference, operator mapping, and threshold-property calculation. It infers available `operators` and `thresholder` values from `RuleFactorDefinition`, and infers selectable rule-factor options at the `AtomicRuleGroup` level.

## Prerequisites

- [rule-factor](../baseline/rule-factor.md)
- [rule-factor-interpreter](../baseline/rule-factor-interpreter.md)

## Domain Model

```mermaid
classDiagram
  class SchedulerState {
    <<enum>>
    EDITING
    LOCKED
  }

  class WorkspaceCoordinationEventType {
    <<enum>>
    REMOVE
  }

  class WorkspaceCoordinationEvent {
    <<interface>>
    +type: WorkspaceCoordinationEventType
    +sourceId: string
  }

  class GroupCoordinationEventType {
    <<enum>>
    OK
    EDIT
    CANCEL
    REMOVE


  class GroupCoordinationEvent {
    <<interface>>
    +type: GroupCoordinationEventType
    +sourceId: string
  }

  class WorkspaceCoordination {
    <<interface>>
    +bus: EventBus
    +allFactors: Signal
  }

  class GroupCoordination {
    <<interface>>
    +bus: EventBus
    +editingRuleId: Signal
    +factors: Signal


  class AtomicRule {
    <<interface>>
  }

  class AtomicRuleGroup {
    <<interface>>
    +coordination: GroupCoordination
  }

  class AtomicRuleScheduler {
    <<class>>
    +state: computed
  }

  class AtomicRuleForm {
    <<interface>>
  }

  class FactorInferrer {
    <<class>>
  }

  class OperatorInferrer {
    <<class>>
  }

  class ThresholderInferrer {
    <<class>>
  }

  class FactorOptionsInferrer {
    <<class>>
  }

  class RuleWorkspaceScheduler {
    <<class>>
    +coordination: WorkspaceCoordination
  }

  %% State dependencies
  AtomicRuleScheduler ..> SchedulerState

  %% Composition (lifecycle-bound)
  AtomicRuleScheduler *-- AtomicRuleForm
  AtomicRuleScheduler *-- FactorInferrer
  AtomicRuleScheduler *-- OperatorInferrer
  AtomicRuleScheduler *-- ThresholderInferrer

  %% Protocol: parent realizes coordination, child depends on coordination
  RuleWorkspaceScheduler ..|> WorkspaceCoordination
  AtomicRuleGroup ..|> GroupCoordination
  AtomicRuleScheduler ..> GroupCoordination

  %% Event (level-specific coordination events)
  AtomicRuleGroup ..> WorkspaceCoordinationEvent
  AtomicRuleScheduler ..> GroupCoordinationEvent

  %% Signal channel (downstream dependency)
  RuleWorkspaceScheduler ..> AtomicRuleGroup
  AtomicRuleGroup ..> AtomicRuleScheduler

  %% Data dependencies
  AtomicRuleGroup o-- AtomicRule
  AtomicRuleScheduler ..> AtomicRule
  AtomicRuleGroup ..> FactorOptionsInferrer

  WorkspaceCoordinationEvent ..> WorkspaceCoordinationEventType
  GroupCoordinationEvent ..> GroupCoordinationEventType
```

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
