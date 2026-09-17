# RuleWorkspaceRuleFactor

## Prerequisites

- [Rule Factor Definition](../../baseline/rule-factor.md)
- [Resource](./resource.md)
- [Workspace Version](./workspace-version.md)

## Definition

A version-local managed definition that the Rule Setter consumes when configuring an Atomic Rule. It owns the editable semantic definition from the [Rule Factor Definition](../../baseline/rule-factor.md) specification and refers to a managed [Resource](./resource.md) by identifier instead of embedding a runtime resource payload.

## Synonyms

None

## Attributes

- **Identifier**: the unique Rule Factor identity within a Workspace Version and the `name` of its projected Rule Factor Definition.
- **Definition**: the title, description, data type, semantic, mode, quantity, and constraints of the projected Rule Factor Definition.
- **Resource Identifier**: the optional identity of the Resource used to construct the projected resource.

## Data Model

```ts
import type { RuleFactorDefinition } from '../../baseline/rule-factor.md';
import type { RuleWorkspaceResource } from './resource.md';

type RuleWorkspaceRuleFactorDefinition = Omit<RuleFactorDefinition, 'name' | 'resource'>;

interface RuleWorkspaceRuleFactor {
  identifier: string;
  definition: RuleWorkspaceRuleFactorDefinition;
  resourceIdentifier?: RuleWorkspaceResource['identifier'];
}
```

- `identifier` is unique among Rule Factors in a [Workspace Version](./workspace-version.md).
- `resourceIdentifier`, when present, must identify an existing Resource in the same Workspace Version.

A Rule Factor belongs to one Workspace Version. Its `identifier` becomes the `name` in its projected `RuleFactorDefinition`; its `definition` supplies the title, description, data type, semantic, mode, quantity, and constraints. When `resourceIdentifier` is present, the projected `resource` is constructed from the identified Resource.

## State Transitions

None

## Constraints

**Static constraints**

- `definition` must satisfy every applicable Rule Factor Definition constraint.
- A Rule Factor without `resourceIdentifier` projects without a `resource`; a Rule Factor with `resourceIdentifier` projects with exactly one resource.
- A Rule Factor identifier is read-only once created.
- A Rule Factor that is not currently needed for configuration may remain in the Workspace Version.
