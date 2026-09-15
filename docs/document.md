# Document Specifications

## Markdown Layout

- Use tables only for compact comparisons or mappings.
- Do not use large tables for narrative content or semantic definitions; use headings and short prose instead.

## Concept Ownership

- An existing specification remains the canonical definition of the concepts it introduces.
- A new specification must reference an existing concept rather than redefine it; it may define only context-specific concerns, such as organization, lifecycle, or release.
- When distinct concepts would otherwise share a name, qualify their names to make their bounded contexts clear.

## Requirement Semantics

- A requirement begins with a `Goal` that states the platform capability and the value it provides to its actors.
- A semantic concept is organized as one bounded section. Its `Definition`, `Data Model`, and `Constraints` are specified within that section.
- Use `metadata` to name descriptive entity data, such as a name and description.
- The `Data Model` may use TypeScript `interface` and `type` declarations to define internal concepts, entity shapes, and state domains.
- An entity-property rule is specified beside the property it constrains in the `Data Model`; examples include requiredness, uniqueness, format, and length.
- A `Constraints` subsection contains rules that govern the concept's capacity, lifecycle, operations, or relationships beyond individual property definitions.
- Each constraint is one list item that states one precise, independently verifiable rule.
- Static constraints and behavioral constraints are identified separately when both apply to the concept.

## Workflow and State Semantics

- A requirement describes its high-level workflows in a `Workflow` section.
- A workflow section may contain nested sections for distinct flows, such as initial setup and subsequent iteration.
- A workflow is represented with a Mermaid flowchart when its sequence or branching is material to understanding the capability.
- A stateful entity defines its states in the `Data Model` and its allowed transitions with a Mermaid state diagram.
- A state diagram distinguishes a transition of an existing entity from the creation of a new entity derived from an existing state.

## Use Case Specifications

- A use case specification follows the UML/RUP format: `Revision History`, `Use-Case Name`, `Brief Description`, `Flow of Events`, `Special Requirements`, `Preconditions`, `Postconditions`, and `Extension Points`.
- `Flow of Events` contains separate `Basic Flow` and `Alternative Flows` subsections.
- Prefer a Mermaid flowchart to describe the basic flow and its branches; retain concise numbered steps where they clarify the actor and platform responsibilities.
- Each alternative flow identifies the basic-flow step where it begins, its triggering condition, and whether it resumes the basic flow or ends the use case.

## Heading Depth

- `####` is the default deepest heading level.
- A heading deeper than `####` is used only when the additional hierarchy is necessary to preserve a meaningful semantic boundary.

## Type Reference Declaration

Allow cross-document references to the `interface` declared in the `markdown block`, following the syntax references in `ES Module` format.

```ts
// Reference the FieldDataSource type mentioned in the spec.md document
import { FieldDataSource } from './spec.md';
```

### Class Diagram

- By default, use simple class diagrams and do not declare `properties` + `methods`
- Association relationships between classes must be defined using standard conventions (e.g. `Dependency`), and should not be created randomly.
