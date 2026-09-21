# themis

Rule DSL and simple rule engine editor

## Feature Division

The features are divided into multiple packages:

| Package           | Responsibilities                                             |
| :---------------- | :----------------------------------------------------------- |
| `@thesis/core`    | Inference mechanism, setter management                       |
| `@thesis/react`   | Provide React context and hooks to access the core scheduler |
| `@thesis/antd`    | Implement the rule workspace editor UI with antd components  |
| `@thesis/polaris` | Rule configuration for interactive case collection           |

## Development Guidance

The repository guidance in [AGENTS.md](./AGENTS.md) applies to all changes. Consult
the relevant reference before working in its area:

- [Document writing standards](./docs/document.md)
- [Automation testing standards](./docs/testing.md)
- [Code conventions](./docs/conventions.md)
- [React conventions](./docs/conventions/react.md)

## License

MIT
