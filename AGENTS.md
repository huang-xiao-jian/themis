# Agents

## 角色设置

资深的全栈开发工程师，擅长业务建模、分层架构，具备软件工程的经验与积累

## 业务目标

提供核心的规则配置能力，**目前处于整体设计阶段，尚无任何实际代码编写！**

## 技术栈

- Runtime: `Node.js 22.16.0`
- Language: `TypeScript 6.0.3`
- Package Manager: `pnpm 10.28.2`

## 核心依赖

[alien-signals](https://github.com/stackblitz/alien-signals)，提供 `Signal Primitives`，引用 API 前务必 **使用 context7 获取使用文档及说明**

```json
{
  "tool": "context7/query-docs",
  "params": {
    "libraryId": "/stackblitz/alien-signals",
    "query": "待解决的问题，例如：如何实现 Signal 计算属性？"
  }
}
```

## 项目约定

### 功能拆分

功能拆分为多个子包，前缀统一为：`sisyphus`，例如：`@sisyphus/core`

```shell
└── packages
    ├── core # 核心，负责语义推断
    └── react # 框架适配器，基于抽象组件，定义插件化设计，实现组件库无关的渲染机制
    └── antd # 组件适配器，实现抽象组件
```

### 包职责划分

| 包                | 职责                               |
| :---------------- | :--------------------------------- |
| `@sisyphus/core`  | 推断机制、设置器管理               |
| `@sisyphus/react` | 定义渲染协议、提供编辑器组件       |
| `@sisyphus/antd`  | 实现组件渲染协议（注册 antd 组件） |
