# WorkspaceRelease

## Prerequisites

- [WorkspaceVersion](./workspace-version.md)

## Definition

A publication record that makes the public **Rules** projected from a released
**Workspace Version** available to external consumers, such as a Downstream
Application.

## Synonyms

None

## Attributes

- **Workspace Identifier**: the identity of the Workspace that owns the released Workspace Version.
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
- **Workspace Version** must contain at least one **Workspace Rule** before it
  can be released.
- A derived **Workspace Version** must differ from its base version's final
  public **Rule** set.
