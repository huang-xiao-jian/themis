# RuleReleasedWorkspaceVersionSnapshot

## Prerequisites

- [Workspace Version](./workspace-version.md)

## Definition

Release is the action that marks an unreleased [Workspace Version](./workspace-version.md) as stable.

## Synonyms

None

## Attributes

- **Workspace Identifier**: the identity of the Rule Workspace that owns the released Workspace Version.
- **Version Identifier**: the identity of the released Workspace Version.
- **Content**: the complete released Workspace Version snapshot.

## Data Model

```ts
import type { RuleWorkspaceVersion } from './workspace-version.md';

interface RuleReleasedWorkspaceVersionSnapshot {
  workspaceIdentifier: string;
  versionIdentifier: string;
  content: RuleWorkspaceVersion;
}
```

A release identifies the complete snapshot of the Workspace Version, including its Resources, Rule Factors, and Rules.

## State Transitions

None

## Constraints

**Static constraints**

- A Workspace Version must contain at least one Rule before it can be released.
- Before release, every Resource and Rule Factor projection must be valid, and each Rule must contain at least one non-empty Atomic Rule Group.
- A derived Workspace Version's final Rule set must differ from its base version's final Rule set; a Rule Factor change alone does not change a final Rule definition.
- Release is one-time and irreversible. A locked Workspace Version cannot be modified or permanently deleted.
