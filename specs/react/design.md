# @sisyphus/react

## 前置依赖

- [@sisyphus/core](../core/design.md)
- [抽象组件设计](../design.md)

## 技术栈

- [react19](https://github.com/facebook/react)
- [alien-signals](https://github.com/stackblitz/alien-signals) - Signal Primitive 支持

## 设计目标

- [x] 明确如何基于规则因子渲染 "配置组件 threshold"
- [x] 明确组件库适配协议

## 渲染层架构

`@sisyphus/react` 作为 **框架适配层**，负责将内核提供的抽象组件属性渲染为具体的 UI 组件。组件推断逻辑由 `@sisyphus/core` 负责，渲染层仅关注属性解释与组件渲染。

### 插件协议

采用 `SisyphusPlugin` 协议定义框架与组件适配包之间的契约：

```ts
/** 组件渲染器注册表 */
interface ComponentRendererRegistry {
  /** 注册 Input 组件 */
  registerInput(component: React.ComponentType<InputProperties>): void;
  /** 注册 TextArea 组件 */
  registerTextArea(component: React.ComponentType<TextAreaProperties>): void;
  /** 注册 Switch 组件 */
  registerSwitch(component: React.ComponentType<SwitchProperties>): void;
  /** 注册 Select 组件 */
  registerSelect(component: React.ComponentType<SelectProperties>): void;
  /** 注册 MultipleSelect 组件 */
  registerMultipleSelect(component: React.ComponentType<MultipleSelectProperties>): void;
  /** 注册 Picker 组件 */
  registerPicker(component: React.ComponentType<PickerProperties>): void;
  /** 注册 RangePicker 组件 */
  registerRangePicker(component: React.ComponentType<RangePickerProperties>): void;
  /** 注册 RangeInput 组件 */
  registerRangeInput(component: React.ComponentType<RangeInputProperties>): void;
}

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
  /** 渲染抽象组件 */
  render(props: AbstractComponentProperties): React.ReactElement;
}
```

**说明**：

- 组件属性类型继承自 [抽象组件属性声明](../design.md#抽象组件属性声明)

## 内建逻辑组件

`ListBuilder` 和 `ListRangeBuilder` 为逻辑组件，实现多值输入场景，内建实现不依赖组件库。

### ListBuilder - 列表构建器

适用于多值单点输入场景，用于构建多个单点值：

```tsx
interface ListBuilderProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'ListBuilder';
  /** 列表项组件类型 */
  readonly itemType: 'Input' | 'Picker';
  /** 禁用状态 */
  disabled?: boolean;
  /** 当前值列表 */
  value: unknown[];
  /** 值变更回调 */
  onChange: (value: unknown[]) => void;
}
```

### ListRangeBuilder - 区间列表构建器

适用于多值区间输入场景，用于构建多个区间值：

```tsx
interface ListRangeBuilderProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'ListRangeBuilder';
  /** 列表项组件类型 */
  readonly itemType: 'RangeInput' | 'RangePicker';
  /** 禁用状态 */
  disabled?: boolean;
  /** 当前值列表 */
  value: Array<[unknown, unknown]>;
  /** 值变更回调 */
  onChange: (value: Array<[unknown, unknown]>) => void;
}
```

## 编辑器组件

编辑器组件封装了 `@sisyphus/core` 提供的设置器，提供完整的 UI 编辑能力。

### AtomicRuleView - 原子规则编辑视图

整合 `name`、`operator`、`threshold` 的完整原子规则编辑器：

```ts
interface AtomicRuleViewProps {
  /** 可选：禁用状态 */
  disabled?: boolean;
  /** 原子规则设置器（由 @sisyphus/core 提供，已包含推断后的组件属性） */
  setter: AtomicRuleSetter;
}
```

**内部结构**：

- name selector - 规则因子选择器
- operator selector - 操作符选择器
- threshold renderer - 基于 factor 渲染对应组件

### AtomicRuleGroupView - 规则组编辑视图

管理多个原子规则编辑器：

```ts
interface AtomicRuleGroupViewProps {
  /** 可选：禁用状态 */
  disabled?: boolean;
  /** 规则组设置器（由 @sisyphus/core 提供） */
  setter: AtomicRuleGroupSetter;
}
```

**内部结构**：

- 规则列表渲染
- 每个规则对应一个 `AtomicRuleView`

### RuleWorkspaceView - 工作空间编辑视图

管理多个规则组编辑器：

```ts
interface RuleWorkspaceViewProps {
  /** 可选：禁用状态 */
  disabled?: boolean;
  /** 规则工作空间（由 @sisyphus/core 提供） */
  workspace: RuleWorkspace;
}
```

**内部结构**：

- 规则组列表渲染
- 每个规则组对应一个 `AtomicRuleGroupView`

## 目录结构

```shell
packages/react/src/
├── built-in/
│   ├── ListBuilder.tsx      # 内建列表构建器
│   ├── ListRangeBuilder.tsx # 内建区间列表构建器
│   └── index.ts
├── app/
│   ├── SisyphusScope.ts       # 应用实例与插件机制
│   ├── ComponentRenderer.ts # 组件渲染器
│   └── index.ts
├── editor/
│   ├── AtomicRuleEditor.tsx
│   ├── AtomicRuleGroupEditor.tsx
│   ├── RuleWorkspaceEditor.tsx
│   └── index.ts
├── index.ts
```

## 使用示例

```tsx
import { createSisyphusScope, RuleWorkspaceEditor } from '@sisyphus/react';
import { createAntdPlugin } from '@sisyphus/antd';
import { RuleWorkspace } from '@sisyphus/core';

// 创建应用实例并安装 antd 插件
const scope = createSisyphusScope();

scope.use(createAntdPlugin());

// 使用编辑器组件
function WorkspaceEditor({ workspace }: { workspace: RuleWorkspace }) {
  return <RuleWorkspaceEditor workspace={workspace} />;
}
```
