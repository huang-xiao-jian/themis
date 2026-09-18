# WorkspaceRelease

## Prerequisites

- [WorkspaceVersion](./workspace-version.md)

## Definition

A publishment record, publish means to make **Rules** within **Workspace Version** available for external, (e.g. The Downstream Application)

## Synonyms

None

## Attributes

- **Workspace Identifier**: the identity of the Rule Workspace that owns the released Workspace Version.
- **Version Identifier**: the identity of the released Workspace Version.
- **Content**: the complete released Workspace Version snapshot.

## Data Model

```ts
import type { WorkspaceVersion } from './workspace-version.md';

interface WorkspaceRelease {
  workspaceIdentifier: string;
  versionIdentifier: string;
  // The descriptive information about this release
  description: string;
  // The publish time
  publishAt: Date;
}
```

## State Transitions

None

## Constraints

- **Publish** is one-time and irreversible. A published Workspace Version stay in **Locked** mode.
- **Workspace Version** must contain at least one Rule before it can be released.
- A derived **Workspace Version** must differ from its base version's final Rule set.
