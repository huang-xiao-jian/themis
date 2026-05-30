# @sisyphus/react

## 前置依赖

- [内核设计](../core/design.md)
- [表单组件设计](../design.md#表单组件设计)

## 技术栈

- [react19](https://github.com/facebook/react)
- [alien-signals](https://github.com/stackblitz/alien-signals) - Signal Primitive 支持

## 设计目标

- 明确组件库适配协议
- 明确编辑器组件渲染机制

## 渲染层架构

`@sisyphus/react` 作为 **框架适配层**，负责将内核提供的抽象组件属性渲染为具体的 UI 组件。组件推断逻辑由 `@sisyphus/core` 负责，渲染层仅关注属性解释与组件渲染。

### 插件协议

采用 `SisyphusPlugin` 协议定义框架与组件适配包之间的契约：

```ts
/** 编辑器组件渲染器注册表 */
interface ComponentRendererRegistry {
  /** 注册 AtomicRuleView 组件 */
  registerAtomicRuleView(component: React.ComponentType<AtomicRuleViewProps>): void;
  /** 注册 AtomicRuleGroupView 组件 */
  registerAtomicRuleGroupView(component: React.ComponentType<AtomicRuleGroupViewProps>): void;
  /** 注册 RuleWorkspaceView 组件 */
  registerRuleWorkspaceView(component: React.ComponentType<RuleWorkspaceViewProps>): void;
}
```

**说明**：编辑器组件负责渲染抽象组件属性，框架适配层隔离 DSL 推断逻辑

```ts
/** Sisyphus 上下文（插件可访问） */
interface SisyphusContext {
  /** 组件渲染器注册表 */
  readonly registry: ComponentRendererRegistry;
}

/** 组件渲染器插件 */
interface SisyphusPlugin {
  /** 插件名称 */
  name: string;
  /** 安装插件 */
  install(context: SisyphusContext): void;
}

/** Sisyphus 实例 */
interface SisyphusScope {
  /** 安装组件渲染器插件 */
  use(plugin: SisyphusPlugin): this;
}

/** 创建 Sisyphus 应用实例 */
function createSisyphusScope(): SisyphusScope;
```

**使用方式**：

```ts
import { createSisyphusScope } from '@sisyphus/react';
import { createAntdPlugin } from '@sisyphus/antd';

// 创建应用实例
const scope = createSisyphusScope();

// 安装 antd 插件
scope.use(createAntdPlugin());
```

### 渲染器工厂

通过 `scope.renderer()` 获取渲染器实例：

```ts
interface SisyphusScope {
  /** 安装组件渲染器插件 */
  use(plugin: SisyphusPlugin): this;
  /** 获取组件渲染器 */
  renderer(): ComponentRenderer;
}

interface ComponentRenderer {
  /** 渲染编辑器组件属性 */
  render(props: EditorComponentProperties): React.ReactElement;
}
```

**说明**：编辑器组件属性定义在 [编辑器组件设计](../design.md#编辑器组件设计)

**说明**：表单组件属性定义在 [表单组件设计](../design.md#表单组件设计)

## 编辑器组件

编辑器组件由插件协议注册，定义编辑器视图层级的 React 组件接口。编辑器组件属性（`AtomicRuleViewProperties` 等）定义在 [编辑器组件设计](../design.md#编辑器组件设计)。

### AtomicRuleView - 原子规则编辑组件

整合 `name`、`operator`、`threshold` 的完整原子规则编辑器，作为规则配置的最小编辑单元：

```tsx
type AtomicRuleViewProps = AtomicRuleViewProperties;
```

### AtomicRuleGroupView - 规则组编辑组件

管理多个原子规则编辑器：

```tsx
type AtomicRuleGroupViewProps = AtomicRuleGroupViewProperties;
```

### RuleWorkspaceView - 工作空间编辑组件

管理多个规则组编辑器：

```tsx
type RuleWorkspaceViewProps = RuleWorkspaceViewProperties;
```

## 目录结构

```shell
packages/react/src/
├── context/
│   ├── SisyphusScopeContext.ts  # Context 定义
│   ├── SisyphusScopeProvider.tsx # Provider 组件
│   ├── useSisyphusScope.ts       # Hook 函数
│   └── index.ts
├── app/
│   ├── SisyphusScope.ts       # 应用实例与插件机制
│   ├── ComponentRenderer.ts # 组件渲染器
│   └── index.ts
├── editor/
│   ├── AtomicRuleView.tsx     # 原子规则编辑组件
│   ├── AtomicRuleGroupView.tsx # 规则组编辑组件
│   ├── RuleWorkspaceView.tsx  # 工作空间编辑组件
│   └── index.ts
├── index.ts
```

**说明**：表单组件属性定义统一在 [表单组件设计](../design.md#表单组件设计) 中维护

**说明**：编辑器组件属性定义统一在 [编辑器组件设计](../design.md#编辑器组件设计) 中维护

## 使用示例

业务方仅感知 `WorkspaceEditor` 层级，通过 `SisyphusScopeProvider` 注入渲染器：

```tsx
import { SisyphusScopeProvider, WorkspaceEditor } from '@sisyphus/react';
import { createAntdPlugin } from '@sisyphus/antd';

// 创建应用实例并安装 antd 插件
const scope = createSisyphusScope();
scope.use(createAntdPlugin());

// 业务方仅需关注 WorkspaceEditor，无需感知内部渲染细节
function App() {
  return (
    <SisyphusScopeProvider scope={scope}>
      <WorkspaceEditor workspace={workspace} />
    </SisyphusScopeProvider>
  );
}
```

**说明**：内部编辑器组件（AtomicRuleView、AtomicRuleGroupView）由插件协议注册，业务方无感知

### 组件库适配层职责

组件库适配包（如 `@sisyphus/antd`）负责：

- 注册编辑器组件实现（AtomicRuleView、AtomicRuleGroupView、RuleWorkspaceView）
- 实现抽象表单组件渲染（Input、Select、ListBuilder 等）
- 提供业务方开箱即用的组件注册

### SisyphusScopeProvider - 作用域提供者

```ts
interface SisyphusScopeProviderProps {
  /** Sisyphus 应用实例 */
  scope: SisyphusScope;
  /** 子元素 */
  children: React.ReactNode;
}
```

### useSisyphusScope - 获取作用域实例

```ts
function useSisyphusScope(): SisyphusScope;
```

**说明**：内部 `ThresholdRenderer` 组件通过 `useSisyphusScope()` 获取渲染器，自动渲染对应的抽象组件
