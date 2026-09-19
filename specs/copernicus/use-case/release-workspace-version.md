# Use Case Specification: Release an Unreleased Workspace Version

## Revision History

| Date       | Version | Description                 | Author |
| :--------- | :------ | :-------------------------- | :----- |
| 2026-09-17 | 1.0     | Initial use-case definition | Codex  |

## 1. Use-Case Name

Release an Unreleased Workspace Version.

## 2. Brief Description

A Rule Manager releases and locks an unreleased Workspace Version, producing
its immutable public Rule artifact. The relevant concepts and constraints are
defined in the [Workspace Version Artifact glossary entry](../glossary/workspace-version-artifact.md)
and the [Workspace Release glossary entry](../glossary/workspace-release.md).

## 3. Preconditions

- The specified Workspace exists and is active, and the specified Workspace Version exists in that workspace and is unreleased.
- The version contains at least one Workspace Rule; every Workspace Rule Factor
  Resource and Workspace Rule Factor projection is valid and resolvable; and
  every public Rule contains at least one non-empty Atomic Rule Group that
  satisfies the canonical Rule Definition constraints.
- If the version is derived, its final public Rule set differs from that of its
  base Workspace Version.

## 4. Postconditions

- On success, the version is permanently released and locked; a Workspace
  Version Artifact containing its public Rules exists and is available
  downstream; no downstream notification is sent.

## 5. Business Rules

- A final public Rule added, removed, or changed from the base satisfies the
  derived-version difference requirement. Metadata, Workspace Rule Factor
  Resource, and Workspace Rule Factor changes alone do not.
- Release locks the complete Workspace Version snapshot, creates its immutable
  Workspace Version Artifact, and immediately makes the artifact's public Rules
  available for downstream retrieval without notification.
- A sibling version with a higher identifier does not prevent release; each version is compared only with its own base.

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
