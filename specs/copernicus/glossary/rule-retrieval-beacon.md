# RuleRetrievalBeacon

## Prerequisites

- [Rule](../../baseline/rule.md)
- [WorkspaceVersionArtifact](./workspace-version-artifact.md)
- [WorkspaceVersion](./workspace-version.md).

## Definition

The only clue for the Downstream Application to request one specified **Rule**
from the [Workspace Version Artifact](./workspace-version-artifact.md) of a
released **Workspace Version**.

## Synonyms

None

## Attributes

- **Workspace Identifier**: the unique reference identity for **Workspace**
- **Workspace Version Identifier**: the unique reference identity for **WorkspaceVersion**
- **Rule Identifier**: the unique reference identity for **WorkspaceRule**

The Workspace and Workspace Version identifiers identify the corresponding
Workspace Version Artifact. The beacon does not expose the artifact as a
separate identifier.

## Data Model

```ts
import type { Workspace } from './workspace.md';
import type { WorkspaceRule } from './workspace-rule.md';
import type { WorkspaceVersion } from './workspace-version.md';

interface RuleRetrievalBeacon {
  // required
  workspaceIdentifier: Workspace['identifier'];
  // required
  versionIdentifier: WorkspaceVersion['identifier'];
  // required
  ruleIdentifier: WorkspaceRule['identifier'];
}
```

## State Transitions

None

## Constraints

None
