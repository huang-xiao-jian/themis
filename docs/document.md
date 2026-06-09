# Document Specifications

## Type Reference Declaration

Allow cross-document references to the `interface` declared in the `markdown block`, following the syntax references in `ES Module` format.

```ts
// Reference the FieldDataSource type mentioned in the spec.md document
import { FieldDataSource } from './spec.md';
```

### Class Diagram

- By default, use simple class diagrams and do not declare `properties` + `methods`
- Association relationships between classes must be defined using standard conventions (e.g. `Dependency`), and should not be created randomly.
