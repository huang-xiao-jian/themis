# 项目规范

## 功能拆分

功能拆分为多个子包，前缀统一为：`sisyphus`，例如：`@sisyphus/core`

```shell
└── packages
    ├── core
    └── react
    └── antd
└── examples
    ├── playground
```

## 包职责划分

| 包                     | 职责                               |
| :--------------------- | :--------------------------------- |
| `@sisyphus/core`       | 推断机制、设置器管理               |
| `@sisyphus/react`      | 定义渲染协议、提供编辑器组件       |
| `@sisyphus/antd`       | 实现组件渲染协议（注册 antd 组件） |
| `@sisyphus/playground` | 规则配置可交互案例集合             |
