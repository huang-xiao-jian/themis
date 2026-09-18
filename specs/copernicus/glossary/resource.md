# WorkspaceResource

## Prerequisites

- [RuleFactorResource](../../baseline/rule-factor.md)
- [WorkspaceVersion](./workspace-version.md)
- [WorkspaceRuleFactor](./rule-factor.md)

## Definition

A version-local, managed source of selectable values. Its definition uses the resource contracts from the [Rule Factor Definition](../../baseline/rule-factor.md) specification, but the [Workspace](./rule-workspace.md) owns its identifier, membership, lifecycle, and the static options or dynamic capabilities configured for that version.

## Synonyms

None

## Attributes

- **Identifier**: the unique identity of Workspace Resource.
- **Metadata**: the descriptive information.
  1. **Title**
  2. **Description**
- **Definition**: the detail definition for **RuleFactorResource**

## Data Model

```ts
import type {
  DynamicRuleFactorResource,
  StaticRuleFactorResource,
} from '../../baseline/rule-factor.md';

interface WorkspaceResourceExtension {
  identifier: string;
  title: string;
  description: string;
}

type DynamicWorkspaceResource = WorkspaceResourceExtension & DynamicRuleFactorResource;
type StaticWorkspaceResource = WorkspaceResourceExtension & StaticRuleFactorResource;
```

- The `identifier` is read-only once created.
- The `name`, `title` is unique among **WorkspaceResource** within **Workspace Version**

## State Transitions

None

## Constraints

None
