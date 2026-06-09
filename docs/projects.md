# Project Specifications

## Function Division

The features are divided into multiple packages, with the prefix uniformly set as: `sisyphus`, for example: `@sisyphus/core`

```shell
└── packages
    ├── core
    └── react
    └── antd
└── apps
    ├── polaris

```

## Division of Responsibilities

| Package             | Responsibilities                                                  |
| :------------------ | :---------------------------------------------------------------- |
| `@sisyphus/core`    | Inference mechanism, setter management                            |
| `@sisyphus/react`   | Define rendering protocol, provide editor components              |
| `@sisyphus/antd`    | Implement component rendering protocol (register antd components) |
| `@sisyphus/polaris` | Rule configuration for interactive case collection                |
