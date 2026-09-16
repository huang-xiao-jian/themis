# Use Case Specification: Derive an Unreleased Workspace Version

## Revision History

| Date       | Version | Description                 | Author |
| :--------- | :------ | :-------------------------- | :----- |
| 2026-09-17 | 1.0     | Initial use-case definition | Codex  |

## 1. Use-Case Name

Derive an Unreleased Workspace Version.

## 2. Brief Description

A Rule Manager derives a new unreleased Workspace Version from a selected released base in an active Rule Workspace. The relevant concepts and constraints are defined in the [Rule requirement](../requirement.md).

## 3. Preconditions

The required target exists in the required lifecycle state stated by this use case.

## 4. Postconditions

- On success, a new unreleased version has the selected base identifier and an independent copy of the base Resources, Rule Factors, Rules, and identifiers; the base remains unchanged.
- The platform changes no state beyond that described above.

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

1. The manager selects a released base and submits new version metadata and identifier.
2. The platform confirms fewer than three unreleased versions exist.
3. The platform validates semantic-version form, uniqueness, and strict ordering above the base.
4. The platform creates the copied unreleased version and records the base.

### 5.2 Alternative Flows

None.

### 5.3 Exception Flows

#### 5.3.1 Invalid base or workspace

The platform refuses a request where the workspace is not active or the base is not released in it.

#### 5.3.2 Unreleased version limit reached

The platform refuses when three unreleased versions exist.

#### 5.3.3 Invalid version data

The platform refuses invalid, duplicate, or insufficiently greater identifiers and invalid metadata.

## 6. Special Requirements

None.

## 7. Extension Points

None.
