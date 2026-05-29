# @sisyphus/core

规则因子支持的内核，负责 `Intermediate Representation` 的推断、匹配操作符 `Operator` 的推断、可用规则因子的推断、`Atomic Rule` 的管理

## 技术栈

- [alien-signals](https://github.com/stackblitz/alien-signals) `Signal Primitive` 支持，使用 `context7` 可获取文档，`libraryId == /stackblitz/alien-signals`

## 设计目标

- **框架无关**：插件实现与框架/组件库解耦，便于多端适配
- **可测试性**：插件逻辑可独立测试，内核仅关注抽象接口契约

## 核心边界

- **导出级别**：`AtomicRuleGroup` / `AtomicRule`，业务方无法感知内部实现
- **推断机制透明**：`Operator` 推断、`Component` 推断对业务方不可见
- **Fetcher 由业务方提供**：通过 `provideXXXFetcher` 注入，内核管理响应式状态

## 协议设计

### Fetcher 接口

业务方按场景组合提供 Fetcher（与 DynamicResource 类型对应），共 4 种类型：

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

### provideXXXFetcher - 类型安全的 Fetcher 注入

通过 `provideXXXFetcher` 工厂函数创建注册项，返回 `FetcherProvider` 类型：

```ts
interface FetcherProvider<T extends FieldDataSource> {
  /** fetcher 实例 */
  readonly fetcher:
    | ElementaryFetcher<T>
    | PaginatedFetcher<T>
    | FilterableFetcher<T>
    | PaginatedFilterableFetcher<T>;
}

/** 基础动态资源 Fetcher Provider */
interface ElementaryFetcherProvider<T extends FieldDataSource> extends FetcherProvider<T> {
  readonly fetcher: ElementaryFetcher<T>;
}

/** 分页动态资源 Fetcher Provider */
interface PaginatedFetcherProvider<T extends FieldDataSource> extends FetcherProvider<T> {
  readonly fetcher: PaginatedFetcher<T>;
}

/** 过滤动态资源 Fetcher Provider */
interface FilterableFetcherProvider<T extends FieldDataSource> extends FetcherProvider<T> {
  readonly fetcher: FilterableFetcher<T>;
}

/** 分页+过滤动态资源 Fetcher Provider */
interface PaginatedFilterableFetcherProvider<T extends FieldDataSource> extends FetcherProvider<T> {
  readonly fetcher: PaginatedFilterableFetcher<T>;
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

**说明**：`StaticResource` 为静态资源，预设选项无需动态加载，不使用 Fetcher。`RuleFactorDefinition.resource.features` 为空数组时对应 `StaticResource`，包含 `pagination`/`filter` 时对应对应的 `DynamicResource` 类型

### DSL 定义

规则因子定义由 `RuleWorkspace` 持有，供 `AtomicRuleGroupSetter` / `AtomicRuleSetter` 共享：

```ts
interface RuleFactorDefinition {
  name: string;
  title: string;
  description?: string;
  dataType: 'string' | 'number' | 'boolean';
  semantic?: 'rate' | 'date' | 'time' | 'datetime' | 'duration' | 'percentage';
  mode?: 'point' | 'range';
  quantity?: 'single' | 'multiple';
  resource?: {
    name: string;
    features?: ('pagination' | 'filter')[];
  };
  constraints?: FieldConstraints;
}
```

### AtomicRuleSetter

原子规则设置器集成推断机制，使用 Signal 固化状态：

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

interface AtomicRuleSetter {
  /** 唯一标识 */
  readonly id: string;
  /** 已激活的规则因子定义 */
  readonly factor: Signal<RuleFactorDefinition | null>;
  /** 可用的匹配操作符列表（由推断机制计算） */
  readonly operators: Signal<readonly FieldDataSource[]>;

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

### AtomicRuleGroupSetter

规则组设置器管理原子规则集合：

```ts
/** 规则组初始化数据（编辑场景） */
interface AtomicRuleGroup {
  /** 已有的原子规则列表 */
  readonly rules: readonly AtomicRule[];
}

interface AtomicRuleGroupSetter {
  /** 规则组唯一标识 */
  readonly id: string;
  /** 已配置的原子规则列表，仅在编辑场景 */
  readonly rules: Signal<readonly AtomicRule[]>;
  /** 已创建的规则实例列表 */
  readonly ruleSetters: Signal<readonly AtomicRuleSetter[]>;
  /** 可用的规则因子列表 */
  readonly factors: Signal<readonly RuleFactorDefinition[]>;
  /** 适配选择器的选项集合，需要排除已使用的规则因子 */
  readonly factorOptions: Signal<readonly FieldDataSource[]>;

  /** 创建原子规则设置器（新建场景） */
  addRule(ruleId: string): AtomicRuleSetter;
  /** 移除原子规则 */
  removeRule(ruleId: string): void;
  /** 验证所有原子规则 */
  validate(): boolean;
  /** 构建规则组 */
  build(): AtomicRuleGroup;
}
```

### RuleWorkspace - 统一入口

使用 Builder Pattern 实例化：

```ts
class RuleWorkspaceBuilder {
  /** 添加规则因子定义 */
  withFactors(factors: RuleFactorDefinition[]): RuleWorkspaceBuilder;
  /** 添加 Fetcher */
  withFetchers(fetchers: readonly FetcherProvider[]): RuleWorkspaceBuilder;
  /** 添加已有规则组（编辑场景可选） */
  withRuleGroups(ruleGroups: readonly AtomicRuleGroup[]): RuleWorkspaceBuilder;
  /** 构建 RuleWorkspace 实例 */
  build(): RuleWorkspace;
}

interface RuleWorkspace {
  /** 已创建的规则组列表，仅在编辑场景 */
  readonly ruleGroups: Signal<readonly AtomicRuleGroup[]>;
  /** 已创建的规则组实例列表 */
  readonly ruleGroupSetters: Signal<readonly AtomicRuleGroupSetter[]>;

  /** 创建规则组设置器（新建场景） */
  addGroup(groupId: string): AtomicRuleGroupSetter;
  /** 移除规则组 */
  removeGroup(groupId: string): void;
  /** 验证所有规则组 */
  validate(): boolean;
  /** 构建所有规则组 */
  build(): readonly AtomicRuleGroup[];
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

// 2. 提供 Fetcher（DynamicResource 必须，StaticResource 无需）
const fetchers = [
  providePaginatedFilterableFetcher({
    fetch(keyword, page, pageSize) {
      return api.searchEmployees(keyword, page, pageSize);
    },
  }),
  provideElementaryFetcher({
    fetch() {
      return api.getCities();
    },
  }),
];

// 3. 构建 RuleWorkspace
const workspace = new RuleWorkspaceBuilder().withFactors(factors).withFetchers(fetchers).build();

// 4. 创建规则组
const group = workspace.addGroup('group-1');

// 5. 创建原子规则
const rule = group.addRule('rule-1');

// 6. 用户选择规则因子（触发推断）
rule.onFieldChange({ field: 'name', value: 'employee' });
// 自动：factor 切换、operators 推断、重置 operator/threshold

// 7. 用户选择操作符
rule.onFieldChange({ field: 'operator', value: 'eq' });

// 8. 用户输入阈值
rule.onFieldChange({ field: 'threshold', value: 100 });

// 9. 验证并构建
if (group.validate()) {
  const atomicRuleGroup = group.build();
}
```

### 编辑场景

```ts
// 已有规则组数据（从后端加载）
const existingGroups: AtomicRuleGroup[] = [
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
  .withRuleGroups(existingGroups)
  .build();

// 通过 build 获取最终结果（包含编辑后的数据）
if (workspace.validate()) {
  const result = workspace.build();
  console.log('规则组数量:', result.length);
}
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

## 目录结构

```shell
packages/core/src/
├── contracts/
│   ├── fetcher.ts    # Fetcher 接口定义
│   ├── dsl.ts        # DSL 类型定义
│   ├── rule.ts       # AtomicRule / AtomicRuleGroup 定义
│   └── index.ts
├── factory/
│   ├── fetcher.ts    # provideXXXFetcher 工厂函数
│   └── index.ts
├── resource/
│   ├── resource.ts   # ResponseResource 接口定义
│   └── index.ts
├── setter/
│   ├── AtomicRuleSetter.ts
│   ├── AtomicRuleGroupSetter.ts
│   ├── RuleWorkspace.ts
│   └── index.ts
└── index.ts          # 统一导出
```
