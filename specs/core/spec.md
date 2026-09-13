# @thesis/core

Infer `Intermediate Representation`, `Matching Operator`s, `Available Rule Factors`, and encapsulating the **Rule Setter**.

## Goal

- **Framework agnostic**: the core is decoupled from frameworks and component libraries, making it suitable for multiple frameworks and devices.
- **Testability**: the core is responsible for the interpreter and business-logic encapsulation.
- **Layered architecture**: the core follows a DDD-style layered architecture.

## Tech Stack

- [nanoid](https://www.npmjs.com/package/nanoid) for client-side unique identifiers
- [nanoevents](https://github.com/ai/nanoevents) for lightweight event listening
- [formily](https://github.com/alibaba/formily) for forms (`@formily/core`)

## Tech Convention

- Reactive state management is based on `@preact/signals-core` and is treated as a runtime standard rather than part of the core layered architecture.

## References

- [Facade Layer](./facade.md) Expose a type-safe `API` contract.
- [Domain Layer](./domain.md) Encapsulates the core business rules, including rule inference, operator mapping, and threshold-property calculation.
- [Application Layer](./application.md) Orchestrates domain logic and encapsulates rule-configuration data and behavior.
- [Infrastructure Layer](./infrastructure.md) Converts the raw `RuleFactorResource` into `Resource` entities and defines the `Fetcher` abstraction for dynamic resource
