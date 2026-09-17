# Use Case Specification: Retrieve a Released Rule

## Revision History

| Date       | Version | Description                 | Author |
| :--------- | :------ | :-------------------------- | :----- |
| 2026-09-15 | 1.0     | Initial use-case definition | Codex  |

## 1. Use-Case Name

Retrieve a Released Rule.

## 2. Brief Description

A Downstream Application obtains the final definition of one Rule from a specified released Workspace Version. The canonical request shape and retrieval constraints are defined in the [Rule requirement](../requirement.md#rule-retrieval).

```ts
import { RuleRetrievalRequest } from '../requirement.md';
```

The Downstream Application initiates this use case by submitting a `RuleRetrievalRequest` containing the Rule Workspace identifier, Workspace Version identifier, and Rule identifier.

## 3. Preconditions

None.

## 4. Postconditions

- On success, the Downstream Application has the final definition of the specified Rule; no managed definitions change.

## 5. Business Rules

- A Rule remains retrievable from a released Workspace Version after its workspace is archived.

## 6. Flow of Events

```mermaid
flowchart TD
    start([Start]) --> submit[Downstream Application submits RuleRetrievalRequest]
    submit --> available{Does the request identify a Rule in a released Workspace Version?}
    available -->|Yes| archived{Is the workspace archived?}
    archived -->|No| returnRule[Platform returns the Rule's final definition]
    archived -->|Yes| returnRule
    returnRule --> endSuccess([End: Rule returned])

    available -->|No| unavailable[Platform returns a simple unavailable exception]
    unavailable --> endUnavailable([End: Rule unavailable])
```

## 7. Special Requirements

None.

## 8. Extension Points

None.
