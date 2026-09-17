# Use Case Specification: Update an Unreleased Workspace Version

## Revision History

| Date       | Version | Description                 | Author |
| :--------- | :------ | :-------------------------- | :----- |
| 2026-09-17 | 1.0     | Initial use-case definition | Codex  |

## 1. Use-Case Name

Update an Unreleased Workspace Version.

## 2. Brief Description

A Rule Manager changes the metadata of an unreleased Workspace Version. The relevant concepts and constraints are defined in the [Rule requirement](../requirement.md).

## 3. Preconditions

The specified Rule Workspace exists and is active, and the specified Workspace Version exists in that workspace and is unreleased.

## 4. Postconditions

- On success, the version stores validated replacement metadata; its identifier, base, and content remain unchanged.

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
