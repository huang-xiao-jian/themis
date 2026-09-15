# Rule Management

## Goal

Enable Rule Managers to define, version, validate, and release governed rule snapshots, while allowing Downstream Applications to retrieve a specified Rule from a released Workspace Version.

## Actors and Use Cases

| Actor                  | Use cases                                                                                                   |
| :--------------------- | :---------------------------------------------------------------------------------------------------------- |
| Rule Manager           | Create, view, update, archive, and delete Rule Management Workspaces.                                       |
| Rule Manager           | View archived Rule Management Workspaces and their released Workspace Versions.                             |
| Rule Manager           | Create, view, update, and delete unreleased Workspace Versions within an active Rule Management Workspace.  |
| Rule Manager           | View released Workspace Versions within a Rule Management Workspace.                                        |
| Rule Manager           | Derive an unreleased Workspace Version from a selected released Workspace Version.                          |
| Rule Manager           | Create, view, update, and delete Resources, Rule Factors, and Rules within an unreleased Workspace Version. |
| Rule Manager           | Review the complete snapshot of an unreleased Workspace Version before release.                             |
| Rule Manager           | Release an unreleased Workspace Version.                                                                    |
| Downstream Application | [Retrieve a specified Rule from a released Workspace Version.](./user-case/retrieve-released-rule.md)       |

## Semantic Concepts

### Rule Management Workspace

#### Definition

A Rule Management boundary within which Workspace Versions are organized. It is distinct from the runtime rule workspace defined by the core specifications.

#### Data Model

```ts
interface WorkspaceMetadata {
  name: string;
  description: string;
}

type RuleManagementWorkspaceState = 'active' | 'archived';

interface RuleManagementWorkspace {
  identifier: string;
  metadata: WorkspaceMetadata;
  state: RuleManagementWorkspaceState;
  versions: WorkspaceVersion[];
}
```

- `identifier` is unique across active and archived Rule Management Workspaces.
- A workspace has required `name` metadata.
- A workspace `name` is non-empty text.
- A workspace `name` is unique across active and archived Rule Management Workspaces.
- A workspace `name` is at most 40 characters.
- A workspace has required `description` metadata.
- A workspace `description` is non-empty text.
- A workspace `description` is at most 120 characters.

#### State Transition

```mermaid
stateDiagram-v2
    [*] --> Active: create
    Active --> Archived: archive
    Active --> [*]: permanently delete
```

#### Constraints

**Static constraints**

- There may be at most 20 active Rule Management Workspaces.
- Archived workspaces do not count toward the active workspace limit.
- An archived workspace belongs to the Archive Zone.
- Archive Zone behavior is outside the scope of this requirement.

**Behavioral constraints**

- A workspace identifier is read-only once created.
- The Rule Manager supplies workspace metadata when creating a workspace.
- The Rule Manager may change workspace metadata only while the workspace is active.
- An edit that duplicates a workspace name is refused.
- A workspace may be archived only when it contains at least one non-initial released Workspace Version.
- A workspace may be archived only when it has no unreleased Workspace Versions.
- The Rule Manager must permanently delete all unreleased Workspace Versions before archiving a workspace.
- Archiving is permanent.
- Archiving applies only to a Rule Management Workspace.
- Archiving does not change a Rule available from a released Workspace Version.
- Archiving does not make unavailable a Rule available from a released Workspace Version.
- The Rule Manager cannot create content in an archived workspace.
- The Rule Manager cannot change an archived workspace, its versions, or their contents.
- The Rule Manager cannot release a version in an archived workspace.
- The Rule Manager cannot delete an archived workspace, its versions, or their contents.
- An archived workspace remains available to Downstream Applications.
- An active workspace may be permanently deleted only when it has no non-initial released Workspace Versions.
- An active workspace may be permanently deleted only when it has no unreleased Workspace Versions.

### Workspace Version

#### Definition

An isolated line of change within a Rule Management Workspace. It contains version-local Resources, Rule Factors, and Rules. Actions within one Workspace Version do not affect another Workspace Version.

#### Data Model

```ts
type WorkspaceVersionState = 'initial' | 'unreleased' | 'released';

interface WorkspaceVersion {
  identifier: string;
  metadata: WorkspaceMetadata;
  state: WorkspaceVersionState;
  baseVersionIdentifier?: string;
  resources: WorkspaceResource[];
  ruleFactors: WorkspaceRuleFactor[];
  rules: WorkspaceRule[];
}
```

- `identifier` is unique within its Rule Management Workspace.
- `identifier` uses `MAJOR.MINOR.PATCH` semantic-version form.
- A Workspace Version has required `name` metadata.
- A Workspace Version `name` is non-empty text.
- A Workspace Version `name` is unique within its Rule Management Workspace.
- A Workspace Version `name` is at most 40 characters.
- A Workspace Version has required `description` metadata.
- A Workspace Version `description` is non-empty text.
- A Workspace Version `description` is at most 120 characters.

The initial Workspace Version has no base. Each subsequent Workspace Version has exactly one released base version and begins as that version's content snapshot.

#### State Transition

```mermaid
stateDiagram-v2
    [*] --> Initial: create with workspace
    [*] --> Unreleased: derive from a released version
    Initial --> Unreleased: derive a new version
    Unreleased --> Released: release and lock
    Unreleased --> [*]: permanently delete
    Released --> Unreleased: derive a new version
```

A transition from `Initial` or `Released` to `Unreleased` creates a new Workspace Version; it does not change the base version.

#### Constraints

**Static constraints**

- The initial Workspace Version is empty.
- The initial Workspace Version is read-only.
- The initial Workspace Version is treated as released.
- The initial Workspace Version is available solely as the base for subsequent Workspace Versions.
- The initial Workspace Version does not prevent deletion of a workspace that has no non-initial released Workspace Versions.
- A Rule Management Workspace may have at most three unreleased Workspace Versions at one time.
- The initial Workspace Version does not count toward the unreleased version limit.

**Behavioral constraints**

- The platform creates the initial Workspace Version when its Rule Management Workspace is created.
- The Rule Manager supplies the initial Workspace Version identifier and metadata.
- A subsequent Workspace Version may be created only from a released Workspace Version.
- A subsequent Workspace Version inherits its base version's Resources, Rule Factors, Rules, and their identifiers as its initial content.
- Changes to a subsequent Workspace Version do not change its base version.
- The Rule Manager supplies metadata for a subsequent Workspace Version.
- A subsequent Workspace Version does not inherit its base version's metadata.
- A Workspace Version identifier is read-only once created.
- An edit that duplicates a version name within its workspace is refused.
- The Rule Manager chooses a Workspace Version identifier.
- The platform validates a Workspace Version identifier's semantic-version format.
- The platform validates a Workspace Version identifier's uniqueness within its workspace.
- The platform validates that a subsequent Workspace Version identifier is strictly greater than its base version identifier.
- The platform applies no additional validation based on major, minor, or patch level.
- Multiple unreleased Workspace Versions may be derived from the same released Workspace Version.
- A derived Workspace Version is validated only against its own base version.
- A derived Workspace Version may be released when another version derived from the same base has a higher identifier.
- The Rule Manager may view an unreleased Workspace Version at any time.
- The Rule Manager may change an unreleased Workspace Version at any time.
- The Rule Manager may permanently delete an unreleased Workspace Version at any time.
- An unreleased Workspace Version cannot be archived.
- Permanently deleting an unreleased Workspace Version immediately frees an unreleased version slot.

### Resource

#### Definition

The canonical resource association and semantics are owned by the [Rule Factor Definition](../baseline/rule-factor.md) specification. Rule Management owns a Resource's membership and lifecycle within one Workspace Version only.

#### Data Model

```ts
interface WorkspaceResource {
  identifier: string;
}
```

- `identifier` is unique among Resources in a Workspace Version.

A Resource belongs to one Workspace Version and may be used by multiple Rule Factors in that version.

#### Constraints

**Behavioral constraints**

- The Rule Manager cannot create a Resource in a way that leaves an unsatisfied dependency.
- The Rule Manager cannot update a Resource in a way that leaves an unsatisfied dependency.
- The Rule Manager cannot delete a Resource in a way that leaves an unsatisfied dependency.
- An action that leaves an unsatisfied Resource dependency is refused.
- A Resource that is not used by a Rule may remain in the Workspace Version.

### Rule Factor

#### Definition

The canonical definition is owned by the [Rule Factor Definition](../baseline/rule-factor.md) specification. Rule Management owns a Rule Factor's membership and lifecycle within one Workspace Version only.

#### Data Model

```ts
interface WorkspaceRuleFactor {
  identifier: string;
  resourceIdentifier?: string;
}
```

- `identifier` is unique among Rule Factors in a Workspace Version.
- `resourceIdentifier`, when present, must identify an existing Resource in the same Workspace Version.

A Rule Factor belongs to one Workspace Version and may associate with a Resource in that same version.

#### Constraints

**Static constraints**

- Canonical Rule Factor constraints are strict at all times.

**Behavioral constraints**

- Every Atomic Rule must satisfy its Rule Factor's declared constraints when it is created.
- Every Atomic Rule must satisfy its Rule Factor's declared constraints when it is updated.
- The Rule Manager cannot create a Rule Factor in a way that leaves an unsatisfied dependency or constraint.
- The Rule Manager cannot update a Rule Factor in a way that leaves an unsatisfied dependency or constraint.
- The Rule Manager cannot delete a Rule Factor in a way that leaves an unsatisfied dependency or constraint.
- An action that leaves an unsatisfied Rule Factor dependency or constraint is refused.
- A Rule Factor that is not used by a Rule may remain in the Workspace Version.

### Rule

#### Definition

The canonical structure and semantics are owned by the [Rule Definition](../baseline/rule.md) specification. A Rule may contain multiple Atomic Rule Groups. Rule Management does not define how the groups' results are combined; rule selection and execution belong to the Downstream Application. Rule Management owns a Rule's membership and lifecycle within one Workspace Version only.

#### Data Model

```ts
interface WorkspaceRule {
  identifier: string;
  ruleFactorIdentifiers: string[];
}
```

- `identifier` is unique among Rules in a Workspace Version.
- Each `ruleFactorIdentifiers` value must identify an existing Rule Factor in the same Workspace Version.

A Rule belongs to one Workspace Version and may use multiple Rule Factors in that version.

#### Constraints

**Static constraints**

- Resource, Rule Factor, and Rule identifier spaces are independent.
- The same Rule Factor may be used by Atomic Rules in different Atomic Rule Groups of the same Rule.
- Identifier details are defined separately.

**Behavioral constraints**

- The Rule Manager may change a Resource, Rule Factor, or Rule identifier in an unreleased Workspace Version.
- After a Resource, Rule Factor, or Rule is removed from an unreleased Workspace Version, the Rule Manager may create an item of the same kind with that identifier.
- The Rule Manager may remove all Rules from an unreleased Workspace Version.
- A Workspace Version with no Rules cannot be released.

### Release

#### Definition

Release is the action that marks an unreleased Workspace Version as stable.

#### Data Model

```ts
interface ReleasedWorkspaceVersionSnapshot {
  workspaceIdentifier: string;
  versionIdentifier: string;
  content: WorkspaceVersion;
}
```

A release identifies the complete snapshot of the Workspace Version, including its Resources, Rule Factors, and Rules.

#### Constraints

**Static constraints**

- A Workspace Version must contain at least one Rule before it can be released.
- A Workspace Version must contain every Rule Factor required by its Rules before it can be released.
- Each Rule must contain at least one non-empty Atomic Rule Group before its Workspace Version can be released.
- A derived Workspace Version's final Rule set must differ from its base version's final Rule set before it can be released.
- A Rule Factor change does not itself change a final Rule definition.
- Release is one-time and irreversible.
- A locked Workspace Version cannot be modified.
- A locked Workspace Version cannot be permanently deleted.

**Behavioral constraints**

- Adding a final Rule satisfies the derived version release-difference requirement.
- Removing a final Rule satisfies the derived version release-difference requirement.
- Changing a final Rule satisfies the derived version release-difference requirement.
- Changing only workspace metadata does not satisfy the derived version release-difference requirement.
- Changing only Workspace Version metadata does not satisfy the derived version release-difference requirement.
- Changing only internal Resources does not satisfy the derived version release-difference requirement.
- Changing only internal Rule Factors does not satisfy the derived version release-difference requirement.
- Releasing locks the complete Workspace Version snapshot.
- On release, the platform immediately makes the version's Rules available for downstream retrieval.
- On release, the platform does not notify Downstream Applications.

### Rule Retrieval

#### Definition

The interaction in which a Downstream Application requests one specified Rule from a released Workspace Version. Retrieval returns the final Rule definition.

#### Data Model

```ts
interface RuleRetrievalRequest {
  workspaceIdentifier: string;
  versionIdentifier: string;
  ruleIdentifier: string;
}
```

#### Constraints

**Behavioral constraints**

- A retrieval request that does not identify a Rule in a released Workspace Version results in a simple unavailable exception.

## Workflow

### Initial Workflow

```mermaid
flowchart TD
    createWorkspace[Rule Manager creates a Rule Management Workspace]
    createInitial[Platform creates the initial Workspace Version]
    createFirstDraft[Rule Manager creates an unreleased Workspace Version from the initial version]
    configureFirstDraft[Rule Manager configures Resources, Rule Factors, and Rules]
    reviewFirstDraft[Rule Manager reviews the version snapshot]
    releaseFirstDraft[Rule Manager releases the Workspace Version]
    retrieveRule[Downstream Application retrieves a specified Rule]

    createWorkspace --> createInitial
    createInitial --> createFirstDraft
    createFirstDraft --> configureFirstDraft
    configureFirstDraft --> reviewFirstDraft
    reviewFirstDraft --> releaseFirstDraft
    releaseFirstDraft --> retrieveRule
```

### Iteration Workflow

```mermaid
flowchart TD
    selectBase[Rule Manager selects a released Workspace Version]
    createDraft[Rule Manager creates an unreleased Workspace Version from the selected version]
    configureDraft[Rule Manager configures Resources, Rule Factors, and Rules]
    reviewDraft[Rule Manager reviews the version snapshot]
    releaseDraft[Rule Manager releases the Workspace Version]
    releasedVersion[Released Workspace Version]
    retrieveRule[Downstream Application retrieves a specified Rule]

    selectBase --> createDraft
    createDraft --> configureDraft
    configureDraft --> reviewDraft
    reviewDraft --> releaseDraft
    releaseDraft --> releasedVersion
    releasedVersion --> retrieveRule
    releasedVersion --> selectBase
```
