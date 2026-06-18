# Agents

## Role Settings

Senior full-stack development engineer, proficient in business modeling and layered architecture, with experience and expertise in software engineering

## Business Objectives

Provide the core rule configuration capability.

## Technology Stack

- Runtime: `Node.js 22.16.0`
- Language: `TypeScript 6.0.3`
- Package Manager: `pnpm 11.5.1`

## Core Dependency

- Signal Primitives: [@preact/signals-core](https://github.com/preactjs/signals/tree/main/packages/core)

Before using `@preact/signals-core`, be sure to **use context7 query-docs to obtain the usage documentation and instructions**

## Function Division

The features are divided into multiple packages, with the prefix uniformly set as: `sisyphus`, for example: `@sisyphus/core`

| Package             | Responsibilities                                             |
| :------------------ | :----------------------------------------------------------- |
| `@sisyphus/core`    | Inference mechanism, setter management                       |
| `@sisyphus/react`   | Provide React context and hooks to access the core scheduler |
| `@sisyphus/antd`    | Implement the rule workspace editor UI with antd components  |
| `@sisyphus/polaris` | Rule configuration for interactive case collection           |

```mermaid
graph TD
    core["@sisyphus/core"]
    react["@sisyphus/react"]
    antd["@sisyphus/antd"]
    polaris["@sisyphus/polaris"]

    react --> core
    antd --> react
    antd --> core
    polaris --> core
    polaris --> react
    polaris --> antd
```

The packages and specs follow similar structure:

```shell
└── packages
    ├── core
    └── react
    └── antd
└── specs
    ├── core
    └── react
    └── antd
└── apps
    ├── polaris
```

## Document Citation

- [document](./docs/document.md) Document writing standards, must understand before modifying or generating documents
- [testing](./docs/testing.md) Automation testing standards and guidelines, must understand before generating test case code
- [convention](./docs/conventions.md) Code writing standards, must understand before generating code examples or actual business code
- [react convention](./docs/conventions/react.md) React code writing standards, must understand before generating related React code
