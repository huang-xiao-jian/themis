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
- **Times**: the audit times that record its creation and most recent change.

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
  // audit times
  createdAt: number;
  updatedAt: number;
}

type DynamicWorkspaceRuleFactorResource = WorkspaceRuleFactorResourceExtension &
  DynamicRuleFactorResource;
type StaticWorkspaceRuleFactorResource = WorkspaceRuleFactorResourceExtension &
  StaticRuleFactorResource;

type WorkspaceRuleFactorResource =
  DynamicWorkspaceRuleFactorResource | StaticWorkspaceRuleFactorResource;
```

- The `identifier` is read-only once created.
- The `name` and `title` are unique among **WorkspaceRuleFactorResource** values
  within a **WorkspaceVersion**.
- The platform sets `createdAt` when it creates a Workspace Rule Factor Resource
  and updates `updatedAt` whenever the resource changes.

### Workspace Rule Factor Resource Creation

The input a Rule Manager provides to create a Workspace Rule Factor Resource:

```ts
interface WorkspaceRuleFactorResourceMaterialExtension {
  identifier: string;
  title: string;
  description: string;
}

type DynamicWorkspaceRuleFactorResourceMaterial = WorkspaceRuleFactorResourceMaterialExtension &
  DynamicRuleFactorResource;
type StaticWorkspaceRuleFactorResourceMaterial = WorkspaceRuleFactorResourceMaterialExtension &
  StaticRuleFactorResource;
type WorkspaceRuleFactorResourceMaterial =
  DynamicWorkspaceRuleFactorResourceMaterial | StaticWorkspaceRuleFactorResourceMaterial;
```

### Workspace Rule Factor Resource Modification

The input a Rule Manager provides to update a Workspace Rule Factor Resource:

```ts
interface WorkspaceRuleFactorResourcePatchExtension {
  title: string;
  description: string;
}

type DynamicWorkspaceRuleFactorResourcePatch = WorkspaceRuleFactorResourcePatchExtension &
  DynamicRuleFactorResource;
type StaticWorkspaceRuleFactorResourcePatch = WorkspaceRuleFactorResourcePatchExtension &
  StaticRuleFactorResource;
type WorkspaceRuleFactorResourcePatch =
  DynamicWorkspaceRuleFactorResourcePatch | StaticWorkspaceRuleFactorResourcePatch;
```

## State Transitions

None

## Constraints

None
