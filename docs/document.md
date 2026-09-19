# Documentation Conventions

## Purpose and Scope

This guide applies to Markdown specifications in `specs/`, including requirements,
use cases, workflows, and their diagrams. It does not govern source code, tests,
API implementation, or general Markdown such as `README.md`.

**Must**, **Should**, and **May** mean required, recommended, and optional. A
specific rule overrides a general one.

## ADRs

- [Unify Business-Concept Relationships](./adr/unify-business-concept-relationships.md)

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

## Specification Templates

Use these documents as the structural templates for new specifications:

- [Requirement specification template](../specs/copernicus/requirement.md)
- [Use-case specification template](../specs/copernicus/use-case/retrieve-rule-from-released-workspace-version.md)

Preserve the applicable template structure. Update a template when a structural
change should become a convention for future specifications.
