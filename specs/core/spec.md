# @sisyphus/core

规则配置的内核，负责 `Intermediate Representation` 的推断、匹配操作符 `Operator` 的推断、可用规则因子的推断、规则配置的逻辑封装

## 前置依赖

- [规则及规则因子描述](../spec.md)
- [规则因子解释器](../interpreter.md)

## 设计目标

- **框架无关**：内核实现与框架/组件库解耦，便于多框架、多终端适配
- **可测试性**：内核负责核心解释器、业务逻辑封装
- **分层架构**：内核实现遵循领域驱动设计风格的分层架构

## 设计约定

- 响应式状态管理基于 `@preact/signals-core`，看做运行时标准，不纳入内核分层架构范畴

## 分层架构指引

- 接入层：对外暴露类型安全的 `API` 协议，简化业务方实例化内核应用层的过程
- 基础设施层：将原始 `RuleFactorResource` 转化为 `Resource` 实体，定义动态资源获取的 `Fetcher` 抽象，依赖业务方提供 `Fetcher` 实现
- 应用层：编排领域逻辑，负责规则配置的数据、行为封装
- 领域层：封装核心业务规则，包括规则推断机制、操作符映射逻辑、阈值属性计算逻辑。根据 `RuleFactorDefinition` 定义推断可用 `operators` 和 `thresholder`，以及 `AtomicRuleGroup` 级别的可选规则因子选项推断

## 协议设计

### 基础设施层

**特别说明**：`Resource` 实体的具体协议定义详见 [interpreter.md](../interpreter.md)，`StaticResource` 为静态资源，预设选项无需动态加载

#### Fetcher 端口

业务方按场景组合提供 `Fetcher`，作为具体的实现细节

```ts
// 基础动态资源 Fetcher - 无分页、无过滤
interface ElementaryFetcher<T = FieldDataSource> {
  fetch(): Promise<T[]>;
}

// 分页动态资源 Fetcher
interface PaginatedFetcher<T = FieldDataSource> {
  fetch(page: number, pageSize: number): Promise<PaginatedResult<T>>;
}

// 过滤动态资源 Fetcher
interface FilterableFetcher<T = FieldDataSource> {
  fetch(keyword: string): Promise<T[]>;
}

// 分页+过滤动态资源 Fetcher
interface PaginatedFilterableFetcher<T = FieldDataSource> {
  fetch(keyword: string, page: number, pageSize: number): Promise<PaginatedResult<T>>;
}
```

#### 资源工厂与 Fetcher 管理

##### 依赖关系

```
┌─────────────────────────────────────────────────────────┐
│                  ResourceFactoryFacade                 │
│                    (统一资源工厂)                        │
└───────────────────────┬─────────────────────────────────┘
                        │ 依赖
        ┌───────────────┴───────────────┐
        ▼                               ▼
┌───────────────────┐         ┌───────────────────┐
│ StaticResourceFactory │       │ DynamicResourceFactory │
│   (静态资源工厂)     │         │   (动态资源工厂)     │
└───────────────────┘         └─────────┬───────────┘
                                        │ 依赖
                                ┌───────┴───────┐
                                ▼               ▼
                        ┌───────────────┐  ┌───────────────┐
                        │ StaticResource │  │ FetcherRegistry │
                        │ (内核默认)     │  │ (业务方提供)   │
                        └───────────────┘  └───────────────┘
```

**依赖关系说明**：

| 组件                     | 依赖方            | 说明                             |
| :----------------------- | :---------------- | :------------------------------- |
| `ResourceFactoryFacade`  | -                 | 统一入口，协调静态/动态工厂      |
| `StaticResourceFactory`  | -                 | 无外部依赖，内核默认提供 options |
| `DynamicResourceFactory` | `FetcherRegistry` | 必须依赖 registry 获取 Fetcher   |
| `FetcherRegistry`        | -                 | 业务方注册、管理 Fetcher         |

##### 抽象设计

```ts
/**
 * 资源工厂基类
 */
abstract class ResourceFactory<T extends Resource> {
  abstract create(factorResource: DynamicRuleFactorResource);
}

/**
 * 统一资源工厂入口
 */
class ResourceFactoryFacade {
  /* ... */
}
```

**职责说明**：

- `FetcherRegistry`：业务方注册和管理 Fetcher，支持基于资源名称查询
- `ResourceFactory`：将 `RuleFactorDefinition` 转换为 `Resource` 领域实体
- `ResourceFactoryFacade`：统一入口，根据 DSL 特征自动选择合适的工厂

### 接入层

#### Fetcher 工厂函数

通过 `provideXXXFetcher` 工厂函数创建类型安全的 `Fetcher` 注册项：

```ts
interface FetcherProvider<T extends FieldDataSource> {
  readonly fetcher:
    | ElementaryFetcher<T>
    | PaginatedFetcher<T>
    | FilterableFetcher<T>
    | PaginatedFilterableFetcher<T>;
}

function provideElementaryFetcher<T extends FieldDataSource>(
  fetcher: ElementaryFetcher<T>
): ElementaryFetcherProvider<T>;

function providePaginatedFetcher<T extends FieldDataSource>(
  fetcher: PaginatedFetcher<T>
): PaginatedFetcherProvider<T>;

function provideFilterableFetcher<T extends FieldDataSource>(
  fetcher: FilterableFetcher<T>
): FilterableFetcherProvider<T>;

function providePaginatedFilterableFetcher<T extends FieldDataSource>(
  fetcher: PaginatedFilterableFetcher<T>
): PaginatedFilterableFetcherProvider<T>;
```

#### Builder Pattern 入口

**工厂函数 vs Builder Pattern** 职责边界：

- `createRuleWorkspace`：简化入口，一站式创建规则工作空间，适合简单场景
- `RuleWorkspaceBuilder`：链式配置入口，适合需要精细控制配置的场景

```ts
/**
 * 简化工厂函数 - 一站式创建（推荐新手场景）
 */
function createRuleWorkspace(config: {
  factors: RuleFactorDefinition[];
  fetchers?: readonly FetcherProvider[];
  ruleGroups?: readonly AtomicRuleGroup[];
}): RuleWorkspaceScheduler;

/**
 * Builder Pattern - 链式配置入口（推荐标准场景）
 */
class RuleWorkspaceBuilder {
  /**
   * 配置规则因子定义（必须）
   */
  withFactors(factors: RuleFactorDefinition[]): RuleWorkspaceBuilder;

  /**
   * 配置动态资源 Fetcher（DynamicResource 必须，StaticResource 由内核默认提供）
   */
  withFetchers(fetchers: readonly FetcherProvider[]): RuleWorkspaceBuilder;

  /**
   * 配置已有规则组数据（编辑场景可选，新建场景可不传入）
   */
  withRuleGroups(ruleGroups: readonly AtomicRuleGroup[]): RuleWorkspaceBuilder;

  /**
   * 构建工作空间调度器
   */
  build(): RuleWorkspaceScheduler;
}
```

**使用场景区分**：

| 场景     | 推荐方式                     | 说明                                                  |
| :------- | :--------------------------- | :---------------------------------------------------- |
| 新建规则 | `Builder`                    | 无需 `withRuleGroups`，通过 `addGroup`/`addRule` 创建 |
| 编辑规则 | `Builder` + `withRuleGroups` | 传入已有数据，自动还原规则组和原子规则                |
| 简单测试 | `createRuleWorkspace`        | 一行代码创建，配置项均可选                            |

### 应用层

#### AtomicRuleScheduler

原子规则设置器集成推断机制：

```ts
/** 表单字段标识 */
type FieldName = 'name' | 'operator' | 'threshold';

/** 表单字段变更 Action */
interface FieldChangeAction {
  field: FieldName;
  value: unknown;
}

/** 原子规则初始化数据（编辑场景） */
interface AtomicRule {
  /** 规则标识 */
  readonly id: string;
  /** 规则因子名称 */
  readonly name: string;
  /** 操作符 */
  readonly operator: string;
  /** 阈值 */
  readonly threshold: unknown;
}

interface AtomicRuleScheduler {
  /** 唯一标识 */
  readonly id: string;
  /** 已激活的规则因子定义 */
  readonly factor: Signal<RuleFactorDefinition | null>;
  /** 可用的匹配操作符列表（由推断机制计算） */
  readonly operators: Signal<readonly FieldDataSource[]>;
  /** threshold 渲染组件属性（由推断机制计算）  */
  readonly thresholder: Signal<readonly ThresholdComponentProperties>;

  /** 选中的规则因子名称（表单字段，用户行为触发变更） */
  readonly name: Signal<string | null>;
  /** 选中的操作符（表单字段，用户行为触发变更） */
  readonly operator: Signal<string | null>;
  /** 阈值（表单字段，用户行为触发变更） */
  readonly threshold: Signal<unknown>;

  /**
   * 表单字段变更回调（供组件 onChange 绑定，单个方法处理三个字段）
   * - field='name' 时：自动触发 factor 切换、operators 推断、重置 operator/threshold
   * - field='operator' 时：更新操作符
   * - field='threshold' 时：更新阈值
   */
  readonly onFieldChange: (action: FieldChangeAction) => void;

  /** 验证配置是否完整可用 */
  validate(): boolean;
  /** 构建原子规则 */
  build(): AtomicRule;
}
```

**内部协作协议**

`AtomicRuleScheduler` 与领域层推断器的协作流程：

- `AtomicRuleScheduler` 依赖 `OperatorInferrer` 和 `ThresholderInferrer` 进行推断
- 当用户选择规则因子时，自动触发 `operators` 和 `thresholder` 的重新推断
- 推断器采用 Class 风格，便于扩展和依赖注入

```ts
/**
 * 操作符推断器
 */
class OperatorInferrer {
  infer(factor: RuleFactorDefinition): readonly FieldDataSource[];
}

/**
 * 阈值渲染组件属性推断器
 */
class ThresholderInferrer {
  infer(factor: RuleFactorDefinition, operator: string): ThresholdComponentProperties;
}
```

#### AtomicRuleGroupScheduler

规则组设置器管理原子规则集合：

```ts
/** 规则组初始化数据（编辑场景） */
interface AtomicRuleGroup {
  /** 已有的原子规则列表 */
  readonly rules: readonly AtomicRule[];
}

interface AtomicRuleGroupScheduler {
  /** 规则组唯一标识 */
  readonly id: string;
  /** 已配置的原子规则列表，仅在编辑场景 */
  readonly snapshots: readonly AtomicRule[];
  /** 已创建的规则实例列表 */
  readonly rules: Signal<readonly AtomicRuleScheduler[]>;
  /** 可用的规则因子列表 */
  readonly factors: Signal<readonly RuleFactorDefinition[]>;
  /** 适配选择器的选项集合，需要排除已使用的规则因子 */
  readonly factorOptions: Signal<readonly FieldDataSource[]>;

  /** 创建原子规则设置器（新建场景） */
  addRule(ruleId: string): AtomicRuleScheduler;
  /** 移除原子规则 */
  removeRule(ruleId: string): void;
  /** 验证所有原子规则 */
  validate(): boolean;
  /** 构建规则组 */
  build(): AtomicRuleGroup;
}
```

**factorOptions 推断逻辑**

`factorOptions` 用于在规则组中选择规则因子时提供可选列表，需排除已配置的规则因子。

**特别说明**：`FactorOptionsInferrer` 属于 `AtomicRuleGroup` 级别，每个规则组独立维护自己的 `factorOptions`，不同规则组之间 **不共享**。

```ts
/**
 * factorOptions 推断规则
 *
 * 1. 数据源：factors.signal（RuleWorkspace 共享的规则因子定义列表）
 * 2. 排除规则：已存在于 rules.signal 中的原子规则的 name
 * 3. 输出格式：转换为 FieldDataSource[] 供 Select 组件使用
 * 4. 作用域：AtomicRuleGroup 级别，每个规则组独立计算
 */
```

#### RuleWorkspaceScheduler

统一入口，持有规则因子定义供调度器共享：

```ts
interface RuleWorkspaceScheduler {
  /** 已创建的规则组列表，仅在编辑场景 */
  readonly snapshots: readonly AtomicRuleGroup[];
  /** 已创建的规则组实例列表 */
  readonly groups: Signal<readonly AtomicRuleGroupScheduler[]>;

  /** 创建规则组设置器（新建场景） */
  addGroup(groupId: string): AtomicRuleGroupScheduler;
  /** 移除规则组 */
  removeGroup(groupId: string): void;
  /** 验证所有规则组 */
  validate(): boolean;
  /** 构建所有规则组 */
  build(): readonly AtomicRuleGroup[];
}
```

**生命周期管理方法**

`RuleWorkspaceScheduler` 提供完整的生命周期管理能力：

```ts
interface RuleWorkspaceScheduler {
  /** 已创建的规则组列表，仅在编辑场景 */
  readonly snapshots: readonly AtomicRuleGroup[];
  /** 已创建的规则组实例列表 */
  readonly groups: Signal<readonly AtomicRuleGroupScheduler[]>;

  // 创建与删除
  /** 创建规则组设置器（新建场景） */
  addGroup(groupId: string): AtomicRuleGroupScheduler;
  /** 移除规则组 */
  removeGroup(groupId: string): void;

  // 验证与构建
  /** 验证所有规则组 */
  validate(): boolean;
  /** 构建所有规则组 */
  build(): readonly AtomicRuleGroup[];

  // 生命周期管理
  /** 销毁工作空间，释放所有资源（订阅、缓存等） */
  destroy(): void;
}
```

### 领域层

**核心推断逻辑**：

- `AtomicRule` 级别根据 `RuleFactorDefinition` 推断可用 `operators` 和 `thresholder`，参考 [规则因子解释器](../interpreter.md) 中的推断机制
- `AtomicRuleGroup` 级别的规则因子选项推断，参考 [规则及规则因子描述](../spec.md) 中的规则配置约束章节

#### 推断器类声明

```ts
/**
 * 操作符推断器
 *
 * 根据 dataType + semantic 确定"数据域"，再结合 mode（点/区间）和 quantity（单/多）确定"操作域"
 */
class OperatorInferrer {
  infer(factor: RuleFactorDefinition): readonly FieldDataSource[];
}

/**
 * 阈值渲染组件属性推断器
 *
 * 根据 RuleFactorDefinition 推断中间形态的表单组件 + 表单组件属性
 */
class ThresholderInferrer {
  infer(factor: RuleFactorDefinition, operator: string): ThresholdComponentProperties;
}

/**
 * 规则因子选项推断器
 *
 * 从全部规则因子列表中排除已使用的规则因子
 */
class FactorOptionsInferrer {
  infer(
    allFactors: readonly RuleFactorDefinition[],
    usedFactorNames: ReadonlySet<string>
  ): readonly FieldDataSource[];
}
```

## 业务方使用示例

### 新建场景

```ts
import {
  RuleWorkspaceBuilder,
  providePaginatedFilterableFetcher,
  provideElementaryFetcher,
} from '@sisyphus/core';

// 1. 定义 DSL
const factors: RuleFactorDefinition[] = [
  {
    name: 'employee',
    title: '员工',
    dataType: 'string',
    semantic: 'rate',
    resource: { name: 'Employee', features: ['pagination', 'filter'] },
  },
  {
    name: 'deliver_city',
    title: '目标城市',
    dataType: 'string',
    resource: { name: 'City' }, // 无 features = StaticResource
  },
  {
    name: 'order_amount',
    title: '订单金额',
    dataType: 'number',
    mode: 'range',
    quantity: 'multiple',
  },
];

// 2. 提供 Fetcher（DynamicResource 必须，StaticResource 由内核默认提供）
const fetchers = [
  providePaginatedFilterableFetcher({
    fetch(keyword, page, pageSize) {
      return api.searchEmployees(keyword, page, pageSize);
    },
  }),
  // 注意：StaticResource 无需提供 Fetcher，由内核默认处理
];

// 3. 构建 RuleWorkspace
const workspace = new RuleWorkspaceBuilder().withFactors(factors).withFetchers(fetchers).build();

// 4. 创建规则组
const group = workspace.addGroup('group-1');

// 5. 创建原子规则
const rule = group.addRule('rule-1');

// 6. 用户选择规则因子（触发推断），实现阶段由表单控件适配，业务方尽量避免调用
rule.onFieldChange({ field: 'name', value: 'employee' });
// 自动：factor 切换、operators 推断、重置 operator/threshold

// 7. 用户选择操作符，实现阶段由表单控件适配，业务方尽量避免调用
rule.onFieldChange({ field: 'operator', value: 'eq' });

// 8. 用户输入阈值，实现阶段由表单控件适配，业务方尽量避免调用
rule.onFieldChange({ field: 'threshold', value: 100 });

// 9. 验证并构建
if (workspace.validate()) {
  const rule = workspace.build();
}
```

### 编辑场景

```ts
// 已有规则组数据（从后端加载）
const groups: AtomicRuleGroup[] = [
  {
    rules: [
      { id: 'rule-1', name: 'employee', operator: 'eq', threshold: 100 },
      { id: 'rule-2', name: 'deliver_city', operator: 'in', threshold: ['北京', '上海'] },
    ],
  },
];

// 初始化时传入已有数据
const workspace = new RuleWorkspaceBuilder()
  .withFactors(factors)
  .withFetchers(fetchers)
  .withRuleGroups(groups)
  .build();
```

### 构建最终结果

```ts
// 验证所有规则组并构建最终输出
if (workspace.validate()) {
  // result: readonly AtomicRuleGroup[]
  const result = workspace.build();

  // 提交规则组或者进一步操作
}
```
