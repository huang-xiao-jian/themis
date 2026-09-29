# Adopt Version-Scoped Authoring Snapshots

## Context

Copernicus allows a Rule Manager to derive an unreleased
[Workspace Version](../../specs/copernicus/glossary/workspace-version.md) from
a released version and then independently configure version-local
[Workspace Rule Factor Resources](../../specs/copernicus/glossary/workspace-rule-factor-resource.md),
[Workspace Rule Factors](../../specs/copernicus/glossary/workspace-rule-factor.md),
and [Workspace Rules](../../specs/copernicus/glossary/workspace-rule.md).
The derived version must retain the base version's local identifiers, while
later changes must not affect the base or any sibling version.

The platform needs this isolation to hold for every authoring operation,
including reads, updates, deletions, dependency validation, review, and
release. An unreleased version requires normal editable CRUD and per-concept
creation and update times, but it does not require an auditable event history
for every edit.

A shared-base model with draft overlays could reduce storage by resolving
unchanged definitions from the released base. However, it would make every
read, validation, deletion, and release operation responsible for correctly
resolving inherited records, overrides, and tombstones. A missed resolution
step could expose or modify the wrong version's state.

## Decision

**Adopt physical, version-scoped authoring snapshots.**

Every authoring record belongs to exactly one pair of Workspace and Workspace
Version identifiers. A derived version is created in one transaction with an
independent copy of the base version's complete authoring graph: Resources,
Factors, Rules, Atomic Rule Groups, and Atomic Rules. The copied records retain
their local identifiers and receive the new version scope and creation times.

All authoring reads and mutations must receive the owning Workspace and
Workspace Version identifiers. Repositories must scope queries by those
identifiers and must not load or mutate an authoring record by its local
identifier alone. Storage constraints must enforce same-version dependencies:
a Factor may use only a Resource in its own version.

Mutations are permitted only for an unreleased version. A release validates the
complete local snapshot, locks the version, and produces exactly one immutable
[Workspace Version Artifact](../../specs/copernicus/glossary/workspace-version-artifact.md).
Downstream retrieval reads only that artifact; it never reads the authoring
snapshot.

This decision does not introduce event sourcing, per-edit revision history, a
shared-base overlay, or tombstone records for derived drafts.

## Consequences

### Positive

- Version isolation is structural: operations on one version have no persisted
  route to alter another version, even when both versions use the same local
  identifiers.
- CRUD, validation, deletion, review, and release all operate on one complete
  version scope. They do not need inheritance resolution rules.
- Release is a direct projection from a validated authoring snapshot to an
  immutable public artifact.
- The model implements the existing derivation requirement for an independent
  copy whose later changes do not affect its base.

### Negative

- Derived versions duplicate authoring data and therefore consume storage
  proportional to the size and count of versions.
- Derivation requires a transactional graph copy, and composite version-scoped
  identity and foreign-key constraints must be designed carefully.
- Cross-version comparison requires explicit reads of multiple snapshots; it
  cannot rely on inheritance metadata to infer effective state.

### Example Comparison

When a Rule Manager deletes Factor `F1` from draft `v1.1.0`:

- With this decision, the platform deletes only
  `(workspace, v1.1.0, F1)` after validating rules in `v1.1.0`. The base record
  `(workspace, v1.0.0, F1)` remains unchanged.
- With a shared-base overlay, the platform would need to store a tombstone and
  ensure every read and validator subtracts `F1` from the inherited base.

## Alternatives

1. **Shared released base with draft overlays** → Rejected because inheritance,
   override precedence, and tombstones make isolation and release correctness
   depend on a resolver being used by every code path.
2. **Event-sourced drafts** → Rejected because the requirement does not need
   per-edit audit history, replay, or event-stream reconstruction. It adds
   operational and implementation complexity without improving required version
   isolation.
3. **Mutable Workspace-level Resources, Factors, and Rules referenced by
   versions** → Rejected because a mutation or deletion would directly affect
   every version that references the shared record, violating version
   independence.

## Reversal Conditions

1. **Storage growth makes the required number of versions economically or
   operationally infeasible** → Reassess an overlay design only with a single,
   mandatory effective-snapshot resolver and equivalent isolation guarantees.
2. **A requirement introduces mandatory per-edit audit, rollback, or temporal
   reconstruction within unreleased drafts** → Evaluate an append-only revision
   model while preserving the version-scoped snapshot boundary.
