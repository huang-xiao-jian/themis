# WorkspaceRule

## Prerequisites

- [Rule Definition](../../baseline/rule.md)
- [WorkspaceRuleFactor](./workspace-rule-factor.md)
- [WorkspaceVersion](./workspace-version.md)

## Definition

A version-local managed Rule composed of Atomic Rule Groups. The Rule Setter
creates its Atomic Rules by consuming a [Rule Factor](../../baseline/rule-factor.md).

## Synonyms

None

## Attributes

- **Identifier**: the unique Rule identity within a Workspace Version.
- **Metadata**: the descriptive information for Rule Manager
  1. **Name**
  2. **Description**
- **Atomic Rule Groups**: the groups of self-contained Atomic Rules that compose the Rule.
- **Times**: the audit times that record its creation and most recent change.

## Data Model

```ts
import type { AtomicRule } from '../../baseline/rule.md';

interface WorkspaceAtomicRule {
  identifier: string;
  name: AtomicRule<unknown>['name'];
  operator: AtomicRule<unknown>['operator'];
  threshold: AtomicRule<unknown>['threshold'];
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
  // audit times
  createdAt: number;
  updatedAt: number;
}
```

- The platform sets `createdAt` when it creates a Workspace Rule and updates
  `updatedAt` whenever the Workspace Rule changes.

### Workspace Rule Creation

The input a Rule Manager provides to create a Workspace Rule:

```ts
interface WorkspaceRuleMaterial {
  identifier: string;
  name: string;
  description: string;
  groups: WorkspaceAtomicRuleGroup[];
}
```

### Workspace Rule Modification

The input a Rule Manager provides to update a Workspace Rule:

```ts
interface WorkspaceRulePatch {
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
