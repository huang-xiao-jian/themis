# @sisyphus/react

作为 **框架适配层**，负责将内核提供的表单组件属性渲染为具体的 UI 组件。组件推断逻辑由 `@sisyphus/core` 负责，渲染层仅关注属性解释与组件渲染。

## 前置依赖

- [内核设计](../core/spec.md)
- [表单组件设计](../interpreter.md)

## 技术栈

- [react19](https://github.com/facebook/react)

## 设计目标

- 明确组件库适配协议
- 明确编辑器组件渲染机制

## 编辑器组件

### 编辑器组件设计目标

明确 **编辑器组件** 的属性，用于插件协议注册的组件和渲染器工厂，定义规则编辑视图层级的结构。

### 编辑器组件设计规范

- 编辑器组件与原始 `DSL` 无关联关系
- 编辑器组件通过 `View` 后缀与表单组件区分

### AtomicRuleView - 原子规则编辑组件

整合 `name`、`operator`、`threshold` 的完整原子规则编辑器，作为规则配置的最小编辑单元：

```ts
interface AtomicRuleViewProperties {
  /** 组件类型标识 */
  readonly type: 'AtomicRuleView';
  /** 业务逻辑实体 */
  readonly scheduler: AtomicRuleScheduler;
}
```

### AtomicRuleGroupView - 规则组编辑组件

管理多个原子规则编辑器，用于组织同一层级的规则集合：

```ts
interface AtomicRuleGroupViewProperties {
  /** 组件类型标识 */
  readonly type: 'AtomicRuleGroupView';
  /** 业务逻辑实体 */
  readonly scheduler: AtomicRuleGroupScheduler;
}
```

### RuleWorkspaceView - 工作空间编辑组件

管理多个规则组编辑器，作为规则配置的顶层容器：

```ts
interface RuleWorkspaceViewProperties {
  /** 组件类型标识 */
  readonly type: 'RuleWorkspaceView';
  /** 业务逻辑实体 */
  readonly scheduler: RuleWorkspaceScheduler;
}
```

### WorkspaceEditor - 业务方入口组件

`WorkspaceEditor` 是业务方直接使用的顶层组件，封装了内部编辑器组件的实现细节：

```ts
interface WorkspaceEditorProps {
  /** 工作空间实例 */
  workspace: RuleWorkspaceScheduler;
}

function WorkspaceEditor(props: WorkspaceEditorProps): React.ReactElement;
```

**说明**：`WorkspaceEditor` 内部渲染 `RuleWorkspaceView`，业务方无需感知具体的编辑器组件实现

### 编辑器组件属性类型别名

```ts
type EditorComponentProperties =
  | AtomicRuleViewProperties
  | AtomicRuleGroupViewProperties
  | RuleWorkspaceViewProperties;
```

## 插件协议

采用 `SisyphusPlugin` 协议定义框架与组件适配包之间的契约：

```ts
/** 编辑器组件渲染器注册表 */
interface ComponentRendererRegistry {
  /** 注册 AtomicRuleView 组件 */
  registerAtomicRuleView(component: React.ComponentType<AtomicRuleViewProperties>): void;
  /** 注册 AtomicRuleGroupView 组件 */
  registerAtomicRuleGroupView(component: React.ComponentType<AtomicRuleGroupViewProperties>): void;
  /** 注册 RuleWorkspaceView 组件 */
  registerRuleWorkspaceView(component: React.ComponentType<RuleWorkspaceViewProperties>): void;
}
```

```ts
/** Sisyphus 上下文（插件可访问） */
interface SisyphusContext {
  /** 组件渲染器注册表 */
  readonly registry: ComponentRendererRegistry;
}

interface ComponentRenderer {
  /** 渲染编辑器组件属性 */
  render(props: EditorComponentProperties): React.ReactElement;
}

/** 组件渲染器插件 */
interface SisyphusPlugin {
  /** 插件名称 */
  name: string;
  /** 安装插件 */
  install(context: SisyphusContext): void;
}

/** Sisyphus 实例化参数 */
interface SisyphusScopeOptions {
  /** 安装组件渲染器插件 */
  plugins: readonly SisyphusPlugin[];
}

interface SisyphusScope {
  /** 获取组件渲染器 */
  renderer(): ComponentRenderer;
}

/** 创建 Sisyphus 应用实例 */
function createSisyphusScope(options: SisyphusScopeOptions): SisyphusScope;
```

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

### 组件库适配层职责

组件库适配包（如 `@sisyphus/antd`）负责：

- 注册编辑器组件实现（`AtomicRuleView`、`AtomicRuleGroupView`、`RuleWorkspaceView`）
- 实现表单组件渲染（`Thresholder`）

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

## 使用示例

业务方仅感知 `WorkspaceEditor` 层级，通过 `SisyphusScopeProvider` 注入渲染器：

```tsx
import { SisyphusScopeProvider, WorkspaceEditor, createSisyphusScope } from '@sisyphus/react';
import { createAntdPlugin } from '@sisyphus/antd';

// 创建应用实例
const scope = createSisyphusScope({
  plugins: [createAntdPlugin()],
});

// 业务方仅需关注 WorkspaceEditor，无需感知内部渲染细节
function App() {
  return (
    <SisyphusScopeProvider scope={scope}>
      <WorkspaceEditor workspace={workspace} />
    </SisyphusScopeProvider>
  );
}
```
