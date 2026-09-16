# Use Case Specification: Update a Rule

## Revision History

| Date       | Version | Description                 | Author |
| :--------- | :------ | :-------------------------- | :----- |
| 2026-09-17 | 1.0     | Initial use-case definition | Codex  |

## 1. Use-Case Name

Update a Rule.

## 2. Brief Description

A Rule Manager changes a version-local Rule in an unreleased Workspace Version. The relevant concepts and constraints are defined in the [Rule requirement](../requirement.md).

## 3. Preconditions

The required target exists in the required lifecycle state stated by this use case.

## 4. Postconditions

- On success, the Rule stores the validated replacement definition; its identifier remains unchanged.
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

1. The manager submits a replacement Rule definition.
2. The platform finds the target Rule in the unreleased version.
3. The platform validates the replacement against all applicable constraints.
4. The platform updates the Rule.

### 5.2 Alternative Flows

None.

### 5.3 Exception Flows

#### 5.3.1 Version not editable

The platform refuses the request when the workspace is archived or the version is absent, initial, or released.

#### 5.3.2 Invalid Rule update

The platform refuses an invalid replacement. A Rule must retain non-empty Atomic Rule Groups satisfying the canonical Rule Definition constraints.

## 6. Special Requirements

None.

## 7. Extension Points

None.
