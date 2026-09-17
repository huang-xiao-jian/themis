# RuleRetrievalBeacon

## Prerequesities

- [Rule](./rule.md)
- [Workspace Version](./workspace-version.md).

## Definition

The only clue for the Downstream Application, to request one specified **Rule** from a released **Workspace Version**.

## Synonyms

None

## Attributes

- **Workspace Identifier**: the unique reference identity for **RuleWorkspace**
- **Workspace Version Identifier**: the unique reference identity for **RuleWorkspaceVersion**
- **Rule Identifier**: the unique reference identity for **RuleWorkspaceRule**

## Data Model

```ts
import type { RuleWorkspace } from './rule-workspace.md';
import type { RuleWorkspaceRule } from './rule.md';
import type { RuleWorkspaceVersion } from './workspace-version.md';

interface RuleRetrievalBeacon {
  workspaceIdentifier: RuleWorkspace['identifier'];
  versionIdentifier: RuleWorkspaceVersion['identifier'];
  ruleIdentifier: RuleWorkspaceRule['identifier'];
}
```

## State Transitins

None

## Constraints

None
