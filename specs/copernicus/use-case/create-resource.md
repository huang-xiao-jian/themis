# Use Case Specification: Create a Resource

## Revision History

| Date       | Version | Description                 | Author |
| :--------- | :------ | :-------------------------- | :----- |
| 2026-09-17 | 1.0     | Initial use-case definition | Codex  |

## 1. Use-Case Name

Create a Resource.

## 2. Brief Description

A Rule Manager creates a version-local Resource in an unreleased Workspace Version. The relevant concepts and constraints are defined in the [Resource glossary entry](../glossary/resource.md).

## 3. Preconditions

The specified Workspace exists and is active, and the target Workspace Version exists in that workspace and is unreleased.

## 4. Postconditions

- On success, the Resource exists with its immutable identifier and satisfies applicable managed-definition constraints.

## 5. Flow of Events

### 5.1 Basic Flow

```mermaid
flowchart TD
    start([Start]) --> request[Rule Manager initiates the action]
    request --> validate{Are the applicable constraints satisfied?}
    validate -->|Yes| perform[Platform performs the action]
    perform --> success([End: action completed])
    validate -->|No| reject[Platform refuses and reports the reason]
    reject --> failure([End: request refused])
```

## 6. Special Requirements

None.

## 7. Extension Points

None.
