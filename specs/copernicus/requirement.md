# Rule Management

## Actors and Use Cases

| Actor                  | Use cases                                                                                                   |
| :--------------------- | :---------------------------------------------------------------------------------------------------------- |
| Rule Manager           | Create, view, update, archive, and delete Rule Management Workspaces.                                       |
| Rule Manager           | Create, view, update, and delete unreleased Workspace Versions within an active Rule Management Workspace.  |
| Rule Manager           | View released Workspace Versions within a Rule Management Workspace.                                        |
| Rule Manager           | Create, view, update, and delete Resources, Rule Factors, and Rules within an unreleased Workspace Version. |
| Rule Manager           | Release an unreleased Workspace Version.                                                                    |
| Downstream Application | Retrieve a specified Rule from a released Workspace Version.                                                |

## Semantic Concepts

### Rule Management Workspace

A Rule Management boundary within which Workspace Versions are organized. It is distinct from the runtime rule workspace defined by the core specifications. A workspace identifier is unique across both active and archived workspaces.

A workspace has required `name` and `description` business information, supplied by the Rule Manager on creation and changeable while the workspace is active. Its name is unique across all workspaces, including archived workspaces; an edit that would duplicate a name is refused. Both fields must be non-empty text. A name is at most 40 characters and a description is at most 120 characters. A workspace may be archived permanently only when it contains at least one non-initial released Workspace Version and no unreleased Workspace Versions. An archived workspace is read-only: the Rule Manager cannot create, change, release, or delete it, its versions, or their contents, including their business information. It remains available to Downstream Applications. An active workspace may be permanently deleted only when it has no non-initial released Workspace Versions and no unreleased Workspace Versions.

Archived workspaces belong to an Archive Zone, separate from normal workspace management. Archive Zone behavior is outside the scope of this requirement.

### Workspace Version

An isolated line of change within a Rule Management Workspace. It contains version-local Resources, Rule Factors, and Rules. Actions within one Workspace Version do not affect another Workspace Version.

The initial Workspace Version is created automatically when its Rule Management Workspace is created. The Rule Manager supplies its identifier, required `name`, and required `description`. A version name is unique within its workspace; an edit that would duplicate a name is refused. Both business-information fields must be non-empty text. A name is at most 40 characters and a description is at most 120 characters. It is empty, read-only, and treated as released; it is available solely as the base for subsequent Workspace Versions. It does not prevent deletion of a workspace that has no non-initial released Workspace Versions. Workspace and Workspace Version identifiers are read-only once created.

Every subsequent Workspace Version is created from a released Workspace Version. It inherits the base version's Resources, Rule Factors, and Rules as its initial content, which may then be changed independently. The Rule Manager provides required `name` and `description` business information for the new version; this information is not inherited from the base version. An unreleased Workspace Version may be viewed, changed, or permanently deleted at any time. A released Workspace Version is locked and cannot be changed or deleted, including its business information.

### Resource

The canonical resource association and semantics are owned by the [Rule Factor Definition](../baseline/rule-factor.md) specification. Rule Management owns a Resource's membership and lifecycle within one Workspace Version only. A Resource may be used by multiple Rule Factors in that version.

### Rule Factor

The canonical definition is owned by the [Rule Factor Definition](../baseline/rule-factor.md) specification. Rule Management owns a Rule Factor's membership and lifecycle within one Workspace Version only.

### Rule

The canonical structure and semantics are owned by the [Rule Definition](../baseline/rule.md) specification. A Rule may contain multiple Atomic Rule Groups. Rule Management does not define how the groups' results are combined; rule selection and execution belong to the Downstream Application. Rule Management owns a Rule's membership and lifecycle within one Workspace Version only.

### Release

Release is the one-time, irreversible action that marks an unreleased Workspace Version as stable. A release permanently identifies the complete snapshot of that version, including its Resources, Rule Factors, and Rules. A version cannot be released more than once. On release, the platform immediately makes the version's Rules available for downstream retrieval; it does not notify Downstream Applications.

### Rule Retrieval

The interaction in which a Downstream Application requests one specified Rule from a released Workspace Version. The request identifies the Rule Management Workspace, Workspace Version, and Rule. Retrieval returns only the final Rule definition. A request that does not identify a Rule in a released Workspace Version results in a simple unavailable exception.

### Version-Local Identifiers

Each Resource, Rule Factor, and Rule has an identifier that is unique among concepts of its own kind within a Workspace Version. The identifier spaces for Resources, Rule Factors, and Rules are independent. A Rule Manager may change an identifier in an unreleased version. After an item is removed from an unreleased version, the Rule Manager may create a new item of the same kind with that identifier. Identifier details are defined separately.

## Initial Workflow

1. The Rule Manager creates a Rule Management Workspace and supplies its business information, workspace identifier, and initial Workspace Version identifier and business information.
2. The platform creates the empty, read-only initial Workspace Version and treats it as released.
3. The Rule Manager creates an unreleased Workspace Version derived from the initial Workspace Version.
4. The Rule Manager defines or changes Resources, Rule Factors, and Rules in that unreleased version.
5. The Rule Manager reviews the complete version snapshot and releases it.
6. The Downstream Application retrieves a specified Rule by workspace identifier, version identifier, and rule identifier.

## Subsequent Workflow

1. The Rule Manager creates an unreleased Workspace Version from a released Workspace Version.
2. The Rule Manager changes Resources, Rule Factors, and Rules only in the new version.
3. The Rule Manager reviews the complete version snapshot and releases it.
4. The Downstream Application decides whether and when to retrieve Rules from the newly released version.

## Constraints

### Workspace Capacity

There may be at most 20 active Rule Management Workspaces. Archived workspaces do not count toward this limit.

### Workspace Archival

Archival is permanent and applies only to a Rule Management Workspace. Before a workspace can be archived, the Rule Manager must permanently delete all of its unreleased Workspace Versions. Archiving neither changes nor makes unavailable any Rule that a Downstream Application can retrieve from a released Workspace Version.

### Workspace Version Identifier

Each Workspace Version uses a semantic-version identifier in `MAJOR.MINOR.PATCH` form, such as `1.2.5`. The Rule Manager chooses the version identifier. The platform validates the identifier's format, uniqueness within the workspace, and that a subsequent version is strictly greater than its base version. It applies no additional validation based on major, minor, or patch level.

### Workspace Version Inheritance

A subsequent Workspace Version may be derived only from a released Workspace Version. It inherits that version's Resources, Rule Factors, Rules, and their identifiers as its initial content. Multiple unreleased Workspace Versions may be derived from the same released version. Each derived version is validated only against its own base version; it may be released even if another version derived from that base has a higher identifier.

### Unreleased Version Limit

A Rule Management Workspace may have at most three unreleased Workspace Versions at one time. The initial Workspace Version does not count toward this limit. Permanently deleting an unreleased version immediately frees a slot.

### Release Validity and Locking

A Workspace Version may be released only when it contains at least one Rule and at least one Rule Factor required by that Rule. Each Rule must contain at least one non-empty Atomic Rule Group. A derived version's final Rule set must differ from that of its base version before it can be released. Adding, removing, or changing a final Rule satisfies this condition; changing only workspace or version business information, or only internal Resources or Rule Factors, does not. A Rule Factor change does not itself change a final Rule definition. Releasing locks the complete version snapshot. A locked Workspace Version cannot be modified or permanently deleted.

### Dependency Integrity

Dependencies and canonical Rule Factor constraints within a Workspace Version are strict at all times. A Rule Factor that declares a Resource association requires that Resource to exist in the same version. A Rule requires each Rule Factor that it uses to exist in the same version. Every Atomic Rule must satisfy its Rule Factor's declared constraints when it is created or updated. The same Rule Factor may be used by Atomic Rules in different Atomic Rule Groups of the same Rule. The Rule Manager cannot create, update, or delete Resources, Rule Factors, or Rules in a way that would leave an unsatisfied dependency or constraint; an invalid action is refused. Resources and Rule Factors that are not used by a Rule may remain in the version. The Rule Manager may remove all Rules from an unreleased version, but that version cannot be released until it again satisfies the release conditions.

### Unreleased Version Deletion

An unreleased Workspace Version may be permanently deleted at any time. It cannot be archived.
