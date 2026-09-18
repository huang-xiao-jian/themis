# WorkspaceRuleFactor

## Prerequisites

- [Rule Factor](../../baseline/rule-factor.md)
- [Rule Definition](../../baseline/rule.md)
- [Workspace Resource](./resource.md)
- [Workspace Version](./workspace-version.md)

## Definition

A version-local managed **Rule Factor** in workspace, that the Rule Setter consumes when configuring an **Atomic Rule**.

## Synonyms

None

## Attributes

- **Identifier**: the unique Rule Factor identity within a Workspace Version and the `name` of its projected **RuleFactor**.
- **Definition**: the attributes of the projected **RuleFactor**.
- **Resource Identifier**: the optional identity of the **Workspace Resource** used to construct the projected resource in **RuleFactor**.

## Data Model

```ts
import type { RuleFactor } from '../../baseline/rule-factor.md';
import type { WorkspaceResource } from './resource.md';

interface WorkspaceRuleFactor extends Omit<RuleFactor, 'resource'> {
  identifier: string;
  resourceIdentifier?: WorkspaceResource['identifier'];
}
```

## State Transitions

None

## Constraints

- The `identifier` is read-only once created.
- The `name` is unique among **WorkspaceRuleFactor** in a **WorkspaceVersion**.

## Relationship

- The **WorkspaceVersion** is logical boundary of **WorkspaceRuleFactor** and **WorkspaceResource**
- The **WorkspaceRuleFactor** can only ref a **WorkspaceResource** in the same **WorkspaceVersion**.
- When a **WorkspaceRuleFactor** ref a **WorkspaceResource**, the Resource must maintain existence in the same **WorkspaceVersion**.
