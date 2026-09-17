# RuleWorkspaceResource

## Prerequisites

- [Rule Factor Definition](../../baseline/rule-factor.md)
- [Workspace Version](./workspace-version.md)
- [Rule Factor](./rule-factor.md)

## Definition

A version-local, managed source of selectable values. Its definition uses the resource contracts from the [Rule Factor Definition](../../baseline/rule-factor.md) specification, but the [Rule Workspace](./rule-workspace.md) owns its identifier, membership, lifecycle, and the static options or dynamic capabilities configured for that version.

## Synonyms

None

## Attributes

- **Identifier**: the unique Resource identity within a Workspace Version and the `name` exposed by its projected Rule Factor Resource.
- **Definition**: the static option list or dynamic provider capabilities configured for the Workspace Version.

## Data Model

```ts
import type {
  DynamicRuleFactorResource,
  StaticRuleFactorResource,
} from '../../baseline/rule-factor.md';

type RuleWorkspaceResourceDefinition =
  Omit<StaticRuleFactorResource, 'name'> | Omit<DynamicRuleFactorResource, 'name'>;

interface RuleWorkspaceResource {
  identifier: string;
  definition: RuleWorkspaceResourceDefinition;
}
```

- `identifier` is unique among Resources in a [Workspace Version](./workspace-version.md).
- A static Resource definition contains its version-local option list. A dynamic Resource definition contains only the provider capabilities agreed by the external resource provider.

A Resource belongs to one Workspace Version and may be used by multiple [Rule Factors](./rule-factor.md) in that version.

## State Transitions

None

## Constraints

**Static constraints**

- A Resource's `identifier` is the `name` exposed by its projected Rule Factor Resource. It is not a provider-specific value stored elsewhere.
- A Resource identifier is read-only once created.
- A Resource that is not associated with a Rule Factor may remain in the Workspace Version.
