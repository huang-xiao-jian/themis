# `@sisyphus/core`

The core of rule configuration, responsible for inferring `Intermediate Representation`, inferring matching `Operator`s, inferring available rule factors, and encapsulating the rule configuration logic.

## Prerequisites

- [Rule factor specification](../spec.md)
- [Rule factor interpreter](../interpreter.md)

## Technology Choices

Before using any dependency library `API`, you must use `context7` to get implementation guidance.

- [nanoid](https://www.npmjs.com/package/nanoid) for client-side unique identifiers
- [nanoevents](https://github.com/ai/nanoevents) for lightweight event listening
- [formily](https://github.com/alibaba/formily) for forms (`@formily/core`)

## Design Goals

- **Framework agnostic**: the core is decoupled from frameworks and component libraries, making it suitable for multiple frameworks and devices.
- **Testability**: the core is responsible for the interpreter and business-logic encapsulation.
- **Layered architecture**: the core follows a DDD-style layered architecture.

## Design Convention

- Reactive state management is based on `@preact/signals-core` and is treated as a runtime standard rather than part of the core layered architecture.

## Layered Architecture

- Access layer: exposes a type-safe `API` contract to simplify instantiation of the application layer.
- Infrastructure layer: converts the raw `RuleFactorResource` into `Resource` entities and defines the `Fetcher` abstraction for dynamic resource loading, relying on `Fetcher` implementations supplied by the application.
- Application layer: orchestrates domain logic and encapsulates rule configuration data and behavior.
- Domain layer: encapsulates the core business rules, including rule inference, operator mapping, and threshold-property calculation. It infers available `operators` and `thresholder` values from `RuleFactorDefinition`, and infers selectable rule-factor options at the `AtomicRuleGroup` level.

### Infrastructure Layer

Converts the raw `RuleFactorResource` into `Resource` entities and defines the `Fetcher` abstraction for dynamic resource loading, relying on application-provided `Fetcher` implementations.

[See infrastructure layer design](./infrastructure.md)

### Access Layer

Exposes a type-safe `API` contract to simplify instantiation of the application layer.

[See access layer design](./access.md)

### Domain Layer

Encapsulates the core business rules, including rule inference, operator mapping, and threshold-property calculation.

[See domain layer design](./domain.md)

### Application Layer

Orchestrates domain logic and encapsulates rule configuration data and behavior.

[See application layer design](./application.md)

### Domain Model

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

## Business Usage Example

[See usage example](./usage.md)
