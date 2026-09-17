# Use Case Specification: Create a Rule Workspace

## Revision History

| Date       | Version | Description                 | Author |
| :--------- | :------ | :-------------------------- | :----- |
| 2026-09-17 | 1.0     | Initial use-case definition | Codex  |

## 1. Use-Case Name

Create a Rule Workspace.

## 2. Brief Description

A Rule Manager creates an active Rule Workspace and supplies its metadata and the initial version identifier and metadata. The relevant concepts and constraints are defined in the [Rule Workspace glossary entry](../glossary/rule-workspace.md).

## 3. Preconditions

Fewer than 20 active Rule Workspaces exist.

## 4. Postconditions

- On success, an active Rule Workspace and its empty, read-only initial Workspace Version exist; the active-workspace limit is respected.

## 5. Business Rules

- The Rule Manager supplies the workspace metadata and the initial Workspace Version identifier and metadata.
- The platform validates the submitted data against the applicable Rule Workspace and Workspace Version constraints before creation.
- The platform creates the initial Workspace Version with the Rule Workspace; it is empty and read-only.

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
