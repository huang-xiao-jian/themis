# Documentation Conventions

## Purpose and Scope

This guide applies to Markdown specifications in `specs/`, including requirements,
use cases, workflows, and their diagrams. It does not govern source code, tests,
API implementation, or general Markdown such as `README.md`.

**Must**, **Should**, and **May** mean required, recommended, and optional. A
specific rule overrides a general one.

## General Writing and Layout

- Should use prose and headings for definitions;
- Should use tables only for compact comparisons or mappings.
- Must keep Markdown heading levels within H4 (`####`) and above.
- Forbidden to use H5 (`#####`) and H6 (`######`), unless there is a strictly necessary structural requirement.

### Concept Ownership and References

- The specification that introduces a concept is its canonical definition.
- Later specifications must reference it, and may define only their added concern
  (for example, integration, lifecycle, or release behavior).
- Prose references must link to the source document and identify the concept.
- Use ES-module-style imports with the `.md` extension for types defined in another
  specification. This is documentation notation, not executable TypeScript.

```ts
// FieldDataSource is defined in the referenced specification.
import type { FieldDataSource } from './spec.md';
```

## Mermaid Guideline

- Use a Mermaid flowchart for material sequence or branching; use numbered steps for
  a simple linear flow.
- Use a Mermaid state diagram for state transitions.

## Specification Templates

Use these documents as the structural templates for new specifications:

- [Requirement specification template](../specs/copernicus/requirement.md)
- [Use-case specification template](../specs/copernicus/use-case/retrieve-released-rule.md)

Preserve the applicable template structure. Update a template when a structural
change should become a convention for future specifications.

### Use-Case Business Rules

Use-case specifications must separate policy from the flow of events. Place a
`Business Rules` section after `Postconditions` and before `Flow of Events`.
State applicability, validation criteria, and persistent effects in that
section. The flow itself must describe only the ordered interaction between the
actor and platform; it may refer to applicable business rules without restating
them.
