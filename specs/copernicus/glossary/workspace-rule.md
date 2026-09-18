# WorkspaceRule

## Prerequisites

- [Rule Definition](../../baseline/rule.md)
- [WorkspaceRuleFactor](./rule-factor.md)
- [WorkspaceVersion](./workspace-version.md)

## Definition

A version-local managed aggregate of Atomic Rule Groups. The Rule Setter creates its Atomic Rules by consuming a [Rule Factor](./rule-factor.md).

## Synonyms

None

## Attributes

- **Identifier**: the unique Rule identity within a Workspace Version.
- **Metadata**: the descriptive information for Rule Manager
  1. **Name**
  2. **Description**
- **Atomic Rule Groups**: the groups of self-contained Atomic Rules that compose the Rule.

## Data Model

```ts
import type { AtomicRule } from '../../baseline/rule.md';

interface WorkspaceAtomicRule extends Omit<AtomicRule, 'id'> {
  identifier: string;
}

interface WorkspaceAtomicRuleGroup {
  identifier: string;
  atomicRules: WorkspaceAtomicRule[];
}

interface WorkspaceRule {
  identifier: string;
  name: string;
  description: string;
  groups: WorkspaceAtomicRuleGroup[];
}
```

## State Transitions

None

## Constraints

- The `identifier` is read-only once created.
- The `name` is unique among **WorkspaceRule** within **Workspace Version**

## Relationship

- The **WorkspaceRule** must contain at least one **WorkspaceAtomicRuleGroup**.
- The **WorkspaceAtomicRuleGroup** must contain at least one WorkspaceAtomicRule.
