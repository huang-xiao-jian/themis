# WorkspaceVersionArtifact

## Prerequisites

- [Workspace](./workspace.md)
- [WorkspaceVersion](./workspace-version.md)
- [Rule](../../baseline/rule.md)

## Definition

An immutable public artifact produced from one released
[Workspace Version](./workspace-version.md). It contains the final public
[Rules](../../baseline/rule.md) projected from that version. It excludes the
version's authoring-only Workspace Rule Factor Resources, Workspace Rule
Factors, Workspace Rules, and editing metadata.

## Synonyms

None

## Attributes

- **Workspace Identifier**: the identity of the Workspace that owns the source Workspace Version.
- **Version Identifier**: the identity of the source Workspace Version.
- **Rules**: the complete, immutable set of final public Rules.

## Data Model

```ts
import type { Rule } from '../../baseline/rule.md';
import type { Workspace } from './workspace.md';
import type { WorkspaceVersion } from './workspace-version.md';

interface WorkspaceVersionArtifact {
  workspaceIdentifier: Workspace['identifier'];
  versionIdentifier: WorkspaceVersion['identifier'];
  rules: readonly Rule[];
}
```

The Workspace and version identifiers together uniquely identify a Workspace
Version Artifact.

## State Transitions

None

## Constraints

- A Workspace Version Artifact is created exactly once when its source Workspace Version is released.
- The artifact is immutable after creation.
- The artifact contains at least one Rule.
