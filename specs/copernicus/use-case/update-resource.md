# Use Case Specification: Update a Resource

## Revision History

| Date       | Version | Description                 | Author |
| :--------- | :------ | :-------------------------- | :----- |
| 2026-09-17 | 1.0     | Initial use-case definition | Codex  |

## 1. Use-Case Name

Update a Resource.

## 2. Brief Description

A Rule Manager changes a version-local Resource in an unreleased Workspace Version. The relevant concepts and constraints are defined in the [Resource glossary entry](../glossary/resource.md).

## 3. Preconditions

- The specified Workspace exists and is active, and the target Workspace Version exists in that workspace and is unreleased.
- The specified Resource exists in that Workspace Version.

## 4. Postconditions

- On success, the Resource stores the validated replacement definition; its identifier remains unchanged.

## 5. Business Rules

- A Resource change is refused when it would leave a Rule Factor with an unsatisfied resource association.

## 6. Flow of Events

### 6.1 Basic Flow

```mermaid
flowchart TD
    start([Start]) --> request[Rule Manager initiates the action]
    request --> validate{Are the applicable constraints satisfied?}
    validate -->|Yes| perform[Platform performs the action]
    perform --> success([End: action completed])
    validate -->|No| reject[Platform refuses and reports the reason]
    reject --> failure([End: request refused])
```

## 7. Special Requirements

None.

## 8. Extension Points

None.
