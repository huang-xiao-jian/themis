# Unify Business-Concept Relationships

## Status

Accepted

## Context

Business-concept documents need a common way to explain why concepts are
connected. Without a shared vocabulary, terms such as `contains`, `uses`,
`references`, and `depends on` become inconsistent and make the model harder
to understand across documents.

This decision defines a project-specific semantic vocabulary. It is informed
by familiar modelling terms, but it is not a strict UML relationship model and
does not prescribe UML notation, implementation structure, persistence
behaviour, or object lifecycle behaviour.

## Considered Options

### Use an unconstrained relationship vocabulary

Each author chooses the terms that best fit a document.

This is flexible, but it preserves the inconsistent language that this
decision is intended to resolve.

### Adopt strict UML relationship semantics

Concept documents use the meanings and notation of UML relationships.

This is familiar to readers with UML experience, but it incorrectly binds
business-concept documentation to object-model, persistence, and lifecycle
semantics that the project does not intend to express.

### Adopt a mandatory project-specific semantic vocabulary

Concept documents use a finite, shared set of domain-first relationship kinds.
The names may overlap with UML terminology, but their meanings are defined by
this ADR.

This provides consistency without making implementation choices part of the
business model.

## Decision Outcome

Chosen option: **Adopt a mandatory project-specific semantic vocabulary**.

## Decision

Every document that explicitly describes a relationship between business
concepts **must** classify that relationship using one of the kinds in this
ADR. Authors **must not** introduce an unclassified relationship kind. A new
kind requires a new ADR that extends or replaces this decision.

| Kind           | Meaning                                      | Use when                                                                        |
| -------------- | -------------------------------------------- | ------------------------------------------------------------------------------- |
| Association    | A meaningful business connection.            | The concepts are related but no more specific kind applies.                     |
| Generalization | A conceptual “is a” specialization.          | One concept is a more specific form of another concept.                         |
| Composition    | A constitutive whole–part relationship.      | One concept helps make up another concept as one of its parts.                  |
| Aggregation    | An organizational whole–part relationship.   | One concept groups or organizes independently meaningful concepts.              |
| Dependency     | A required conceptual or operational need.   | One concept needs another to be defined, performed, or understood.              |
| Derivation     | A lineage relationship.                      | One concept originates from another concept.                                    |
| Projection     | A representation-for-a-concern relationship. | One concept expresses another for a distinct management or consumption concern. |

These kinds describe business meaning only. They do not inherit strict UML
semantics. In particular, Composition and Aggregation do not, by themselves,
imply deletion, storage ownership, exclusivity, or runtime object lifetime.
Those rules must be stated separately when they matter.

## Consequences

### Positive

- Concept documents and diagrams use consistent, domain-first terminology.
- Readers can distinguish structural connections, conceptual needs, lineage,
  and alternate representations without inferring implementation details.
- The decision allows Composition and Aggregation to retain their intended
  business meanings without adopting strict UML lifecycle semantics.

### Negative

- Authors must learn and apply the project-specific definitions, even when
  those definitions differ from their UML expectations.
- A relationship can require additional constraints to express lifecycle,
  cardinality, or referential rules.
