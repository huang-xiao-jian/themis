# WorkspaceRuleFactorResource

## Prerequisites

- [RuleFactorResource](../../baseline/rule-factor.md)
- [WorkspaceVersion](./workspace-version.md)
- [WorkspaceRuleFactor](./workspace-rule-factor.md)

## Definition

A version-local, managed source of selectable values for a Workspace Rule
Factor. Its definition uses the resource contracts from the [Rule Factor](../../baseline/rule-factor.md)
specification, but the [Workspace](./workspace.md) owns its identifier,
membership, lifecycle, and the static options or dynamic capabilities
configured for that version.

## Synonyms

None

## Attributes

- **Identifier**: the unique identity of a Workspace Rule Factor Resource.
- **Metadata**: the descriptive information.
  1. **Title**
  2. **Description**
- **Definition**: the detail definition for **RuleFactorResource**.

## Data Model

```ts
import type {
  DynamicRuleFactorResource,
  StaticRuleFactorResource,
} from '../../baseline/rule-factor.md';

interface WorkspaceRuleFactorResourceExtension {
  identifier: string;
  title: string;
  description: string;
}

type DynamicWorkspaceRuleFactorResource = WorkspaceRuleFactorResourceExtension &
  DynamicRuleFactorResource;
type StaticWorkspaceRuleFactorResource = WorkspaceRuleFactorResourceExtension &
  StaticRuleFactorResource;
```

- The `identifier` is read-only once created.
- The `name` and `title` are unique among **WorkspaceRuleFactorResource** values
  within a **WorkspaceVersion**.

## State Transitions

None

## Constraints

None
