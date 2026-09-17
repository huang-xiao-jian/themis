# RuleWorkspaceRule

## Prerequisites

- [Rule Definition](../../baseline/rule.md)
- [Rule Factor](./rule-factor.md)
- [Workspace Version](./workspace-version.md)

## Definition

A version-local managed aggregate of Atomic Rule Groups. The Rule Setter creates its Atomic Rules by consuming a [Rule Factor](./rule-factor.md), but the resulting Atomic Rule is a self-contained rule-definition value; it does not persist a reference to that Rule Factor. A Rule may contain multiple Atomic Rule Groups; their combination, selection, and execution remain the Downstream Application's concern.

## Synonyms

None

## Attributes

- **Identifier**: the unique Rule identity within a Workspace Version.
- **Atomic Rule Groups**: the groups of self-contained Atomic Rules that compose the Rule.
- **Atomic Rule Group Identifier**: the identity of an Atomic Rule Group within the Rule.
- **Atomic Rule Identifier**: the identity of an Atomic Rule within the Rule and the `id` of its projected Atomic Rule.

## Data Model

```ts
import type { AtomicRule } from '../../baseline/rule.md';

interface RuleWorkspaceAtomicRule extends Omit<AtomicRule, 'id'> {
  identifier: string;
}

interface RuleWorkspaceAtomicRuleGroup {
  identifier: string;
  atomicRules: RuleWorkspaceAtomicRule[];
}

interface RuleWorkspaceRule {
  identifier: string;
  atomicRuleGroups: RuleWorkspaceAtomicRuleGroup[];
}
```

- `identifier` is unique among Rules in a [Workspace Version](./workspace-version.md).
- A Rule Workspace Atomic Rule `identifier` is unique within its Rule Workspace Rule.
- A Rule Workspace Atomic Rule Group `identifier` is unique within its Rule Workspace Rule.

A Rule belongs to one Workspace Version. Its projected Atomic Rule uses `identifier` as `id` and copies `name`, `operator`, and `threshold`. A Rule's Atomic Rules do not identify, reference, or depend on a managed Rule Factor after the Rule Setter has created them.

## State Transitions

None

## Constraints

**Static constraints**

- Resource, Rule Factor, and Rule identifier spaces are independent.
- A Rule, Atomic Rule Group, and Atomic Rule identifier is read-only once created.
- Each Atomic Rule Group must contain at least one Atomic Rule.
- Each Atomic Rule Group must satisfy the canonical Atomic Rule constraints in the [Rule Definition](../../baseline/rule.md) specification.
