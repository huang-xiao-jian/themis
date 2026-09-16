# Use Case Specification: Delete a Resource

## Revision History

| Date       | Version | Description                 | Author |
| :--------- | :------ | :-------------------------- | :----- |
| 2026-09-17 | 1.0     | Initial use-case definition | Codex  |

## 1. Use-Case Name

Delete a Resource.

## 2. Brief Description

A Rule Manager permanently deletes a version-local Resource from an unreleased Workspace Version. The relevant concepts and constraints are defined in the [Rule requirement](../requirement.md).

## 3. Preconditions

- The specified Rule Workspace exists and is active, and the target Workspace Version exists in that workspace and is unreleased.
- The specified Resource exists in that Workspace Version.

## 4. Postconditions

- On success, the Resource no longer exists, and the manager may create a Resource with the deleted identifier.

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

1. The manager requests deletion.
2. The platform finds the target Resource in the unreleased version.
3. The platform validates that deletion preserves required associations and structural constraints.
4. The platform permanently deletes the Resource.

### 5.2 Alternative Flows

None.

### 5.3 Exception Flows

#### 5.3.1 Version not editable

The platform refuses the request when the workspace is archived or the version is absent, initial, or released.

#### 5.3.2 Resource deletion would violate constraints

The platform refuses deletion that leaves invalid managed content. A Resource action must not leave a Rule Factor with an unsatisfied resource association.

## 6. Special Requirements

None.

## 7. Extension Points

None.
