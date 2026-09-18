# Rule

## Goal

Enable Rule Managers to define, version, validate, and release governed rule snapshots, while allowing Downstream Applications to retrieve a specified Rule from a released Workspace Version.

## Actors and Use Cases

### Rule Manager

---

- [Create a Rule Workspace](./use-case/create-rule-workspace.md)
- [View an Active Rule Workspace](./use-case/view-rule-workspace.md)
- [View an Archived Rule Workspace](./use-case/view-archived-rule-workspace.md)
- [Update a Rule Workspace](./use-case/update-rule-workspace.md)
- [Archive a Rule Workspace](./use-case/archive-rule-workspace.md)
- [Delete a Rule Workspace](./use-case/delete-rule-workspace.md)

---

- [Create an Unreleased Workspace Version](./use-case/create-unreleased-workspace-version.md)
- [View an Unreleased Workspace Version](./use-case/view-unreleased-workspace-version.md)
- [Update an Unreleased Workspace Version](./use-case/update-unreleased-workspace-version.md)
- [Delete an Unreleased Workspace Version](./use-case/delete-unreleased-workspace-version.md)
- [View a Released Workspace Version](./use-case/view-released-workspace-version.md)
- [Derive an Unreleased Workspace Version](./use-case/derive-workspace-version.md)
- [Review an Unreleased Workspace Version](./use-case/review-unreleased-workspace-version.md)
- [Release an Unreleased Workspace Version](./use-case/release-workspace-version.md)

---

- [Create a Resource](./use-case/create-resource.md)
- [View a Resource](./use-case/view-resource.md)
- [Update a Resource](./use-case/update-resource.md)
- [Delete a Resource](./use-case/delete-resource.md)

---

- [Create a Rule Factor](./use-case/create-rule-factor.md)
- [View a Rule Factor](./use-case/view-rule-factor.md)
- [Update a Rule Factor](./use-case/update-rule-factor.md)
- [Delete a Rule Factor](./use-case/delete-rule-factor.md)

---

- [Create a Rule](./use-case/create-rule.md)
- [View a Rule](./use-case/view-rule.md)
- [Update a Rule](./use-case/update-rule.md)
- [Delete a Rule](./use-case/delete-rule.md)

---

### Downstream Application

- [Retrieve a Released Rule](./use-case/retrieve-released-rule.md)

## Semantic Concepts

Each concept has one canonical definition in the [glossary](./glossary/).

- [Rule Workspace](./glossary/rule-workspace.md)
- [Workspace Version](./glossary/workspace-version.md)
- [Resource](./glossary/resource.md)
- [Rule Factor](./glossary/rule-factor.md)
- [Rule](./glossary/rule.md)
- [Release](./glossary/release.md)
- [Rule Retrieval Beacon](./glossary/rule-retrieval-beacon.md)

For the classified relationships among these concepts, see

## Semantic Concepts Relationship

- [Concept Relationships](./relationships.md).

## Workflow

### First-Version Workflow

```mermaid
flowchart TD
    createWorkspace[Rule Manager creates a Rule Workspace]
    createFirstDraft[Rule Manager creates an unreleased Workspace Version]
    configureFirstDraft[Rule Manager configures Resources, Rule Factors, and Rules]
    reviewFirstDraft[Rule Manager reviews the version snapshot]
    releaseFirstDraft[Rule Manager releases the Workspace Version]
    retrieveRule[Downstream Application retrieves a specified Rule]

    createWorkspace --> createFirstDraft
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
