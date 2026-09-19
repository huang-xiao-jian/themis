# RuleRetrievalBeacon

## Prerequesities

- [Rule](../../baseline/rule.md)
- [WorkspaceVersion](./workspace-version.md).

## Definition

The only clue for the Downstream Application, to request one specified **Rule** from a released **Workspace Version**.

## Synonyms

None

## Attributes

- **Workspace Identifier**: the unique reference identity for **Workspace**
- **Workspace Version Identifier**: the unique reference identity for **WorkspaceVersion**
- **Rule Identifier**: the unique reference identity for **WorkspaceRule**

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

## State Transitins

None

## Constraints

None
