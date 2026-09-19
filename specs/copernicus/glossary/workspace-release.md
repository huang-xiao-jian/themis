# WorkspaceRelease

## Prerequisites

- [WorkspaceVersionArtifact](./workspace-version-artifact.md)
- [WorkspaceVersion](./workspace-version.md)

## Definition

A one-time publication record for the [Workspace Version Artifact](./workspace-version-artifact.md)
produced from a released [Workspace Version](./workspace-version.md). It records
the publication metadata and makes that existing artifact available to external
consumers, such as a Downstream Application.

## Synonyms

None

## Attributes

- **Workspace Identifier**: the identity of the Workspace that owns the released Workspace Version.
- **Version Identifier**: the identity of the released Workspace Version.
- **Description**: the descriptive information about the publication.
- **Published At**: the time at which the artifact became available.

## Data Model

```ts
import type { Workspace } from './workspace.md';
import type { WorkspaceVersion } from './workspace-version.md';

interface WorkspaceRelease {
  workspaceIdentifier: Workspace['identifier'];
  versionIdentifier: WorkspaceVersion['identifier'];
  // The descriptive information about this publication
  description: string;
  // The time at which the artifact became available
  publishedAt: Date;
}
```

## State Transitions

None

## Constraints

- **Publish** is one-time and irreversible. It creates the source version's Workspace Version Artifact and leaves the published Workspace Version in **Locked** mode.
- **Workspace Version** must contain at least one **Workspace Rule** before it
  can be released.
- A derived **Workspace Version** must differ from its base version's final
  public **Rule** set.
