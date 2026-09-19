# WorkspaceRuleFactor

## Prerequisites

- [Rule Factor](../../baseline/rule-factor.md)
- [Rule Definition](../../baseline/rule.md)
- [Workspace Rule Factor Resource](./workspace-rule-factor-resource.md)
- [Workspace Version](./workspace-version.md)

## Definition

A version-local managed **Rule Factor** in workspace, that the Rule Setter consumes when configuring an **Atomic Rule**.

## Synonyms

None

## Attributes

- **Identifier**: the unique Rule Factor identity within a Workspace Version and the `name` of its projected **RuleFactor**.
- **Definition**: the attributes of the projected **RuleFactor**.
- **Resource Identifier**: the optional identity of the **Workspace Rule Factor
  Resource** used to construct the projected resource in **RuleFactor**.

## Data Model

```ts
import type { RuleFactor } from '../../baseline/rule-factor.md';
import type { WorkspaceRuleFactorResource } from './workspace-rule-factor-resource.md';

interface WorkspaceRuleFactor extends Omit<RuleFactor, 'resource'> {
  identifier: string;
  resourceIdentifier?: WorkspaceRuleFactorResource['identifier'];
}
```

## State Transitions

None

## Constraints

- The `identifier` is read-only once created.
- The `name` is unique among **WorkspaceRuleFactor** in a **WorkspaceVersion**.

## Relationship

- The **WorkspaceVersion** is the logical boundary of **WorkspaceRuleFactor** and
  **WorkspaceRuleFactorResource**.
- The **WorkspaceRuleFactor** can refer only to a
  **WorkspaceRuleFactorResource** in the same **WorkspaceVersion**.
- When a **WorkspaceRuleFactor** refers to a **WorkspaceRuleFactorResource**,
  the resource must remain present in the same **WorkspaceVersion**.
