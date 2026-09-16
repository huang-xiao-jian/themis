# Use Case Specification: Release an Unreleased Workspace Version

## Revision History

| Date       | Version | Description                 | Author |
| :--------- | :------ | :-------------------------- | :----- |
| 2026-09-17 | 1.0     | Initial use-case definition | Codex  |

## 1. Use-Case Name

Release an Unreleased Workspace Version.

## 2. Brief Description

A Rule Manager releases and locks an unreleased Workspace Version as a stable snapshot. The relevant concepts and constraints are defined in the [Rule requirement](../requirement.md).

## 3. Preconditions

- The specified Rule Workspace exists and is active, and the specified Workspace Version exists in that workspace and is unreleased.
- The version contains at least one Rule; every Resource and Rule Factor projection is valid and resolvable; and every Rule contains at least one non-empty Atomic Rule Group that satisfies the canonical Rule Definition constraints.
- If the version is derived, its final Rule set differs from that of its base Workspace Version.

## 4. Postconditions

- On success, the version is permanently released and locked; its Rules are available downstream; no downstream notification is sent.

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

1. The manager requests release.
2. The platform verifies at least one Rule and non-empty valid Atomic Rule Groups.
3. The platform validates Resource and Rule Factor projections and resolves Resource references.
4. For a derived version, the platform verifies that the final Rule set differs from its base.
5. The platform locks the snapshot, releases it, and enables retrieval.

### 5.2 Alternative Flows

None.

### 5.3 Exception Flows

#### 5.3.1 Invalid release snapshot

The platform refuses release when there is no Rule, an invalid Rule or projection, or an unresolved Resource reference.

#### 5.3.2 No final Rule difference

The platform refuses a derived version with the same final Rule set as its base.

#### 5.3.3 Version not releasable

The platform refuses when the workspace is archived or the version is absent, initial, or already released.

## 6. Special Requirements

None.

## 7. Extension Points

None.
