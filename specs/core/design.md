# @sisyphus/core

规则因子支持的内核，负责 `Intermediate Representation` 的推断、匹配操作符 `Operator` 的推断、可用规则因子的推断、`Atomic Rule` 的管理

## 技术栈

- [alien-signals](https://github.com/stackblitz/alien-signals) `Signal Primitive` 支持，使用 `context7` 可获取文档，`libraryId == /stackblitz/alien-signals`

## 设计目标

- **框架无关**：插件实现与框架/组件库解耦，便于多端适配
- **可测试性**：插件逻辑可独立测试，内核仅关注抽象接口契约

## 核心边界

- **导出级别**：`RuleGroup` / `AtomicRule`，业务方无法感知内部实现
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

**说明**：`StaticResource` 为静态资源，预设选项无需动态加载，不使用 Fetcher

### DSL 定义

规则因子定义由 `RuleSetter` 持有，供 `RuleGroupSetter` / `AtomicRuleSetter` 共享：

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
interface AtomicRuleSetter {
  /** 唯一标识 */
  readonly id: string;
  /** 已激活的规则因子定义 */
  readonly factor: Signal<RuleFactorDefinition | null>;
  /** 可用的匹配操作符列表（由推断机制计算） */
  readonly operators: Signal<readonly FieldDataSource[]>;
  /** 选中的操作符 */
  readonly operator: Signal<string | null>;
  /** 阈值（外部注入） */
  readonly threshold: Signal<unknown>;
  /** 响应式资源（供适配层使用） */
  readonly resource: Signal<ResponseResource | null>;

  /** 切换规则因子（自动重置 operator/threshold） */
  switch(name: string): void;
  /** 验证阈值是否符合约束 */
  validate(threshold: unknown): boolean;
  /** 构建原子规则 */
  build(): AtomicRule;
}
```

### RuleGroupSetter

规则组设置器管理原子规则集合：

```ts
interface RuleGroupSetter {
  /** 规则组名称 */
  readonly name: string;
  /** 已配置的原子规则列表 */
  readonly rules: Signal<readonly AtomicRule[]>;
  /** 可用的规则因子列表（已排除已使用的规则因子） */
  readonly availableFactors: Signal<readonly RuleFactorDefinition[]>;

  /** 创建原子规则设置器 */
  add(ruleId: string): AtomicRuleSetter;
  /** 移除原子规则 */
  remove(ruleId: string): void;
  /** 构建规则组 */
  build(): RuleGroup;
}
```

### RuleSetter - 统一入口

```ts
interface RuleSetter {
  /** 已创建的规则组列表 */
  readonly ruleGroups: Signal<readonly RuleGroup[]>;

  /** 创建规则组设置器 */
  addGroup(groupId: string): RuleGroupSetter;
  /** 获取规则因子定义 */
  getFactor(name: string): RuleFactorDefinition | undefined;
  /** 验证所有规则组 */
  validate(): boolean;
  /** 构建所有规则组 */
  build(): readonly RuleGroup[];
}

function createRuleSetter(
  factors: RuleFactorDefinition[],
  fetchers: readonly FetcherRegistration[]
): RuleSetter;
```

## 业务方使用示例

```ts
// 1. 定义 DSL
const factors: RuleFactorDefinition[] = [
  {
    name: 'employee',
    title: '员工',
    dataType: 'string',
    resource: { name: 'Employee', features: ['pagination', 'filter'] },
  },
  {
    name: 'deliver_city',
    title: '目标城市',
    dataType: 'string',
    resource: { name: 'City' },
  },
];

// 2. 提供 Fetcher（通过数组+provideXXXFetcher，自动携带 fetcher 类型）
const fetchers = [
  providePaginatedFilterableFetcher({
    fetch(keyword, page, pageSize) {
      return api.searchEmployees(keyword, page, pageSize);
    },
  }),
  // 注：StaticResource 无需 Fetcher，预设选项直接赋值
];

// 3. 创建配置器
const ruleSetter = createRuleSetter(factors, fetchers);

// 4. 创建规则组
const ruleGroup = ruleSetter.addGroup('group-001');

// 5. 创建原子规则
const atomicSetter = ruleGroup.add('rule-001');

// 6. 切换规则因子
atomicSetter.switch('employee');
// factor → employee 定义
// operators → ['=', '≠', 'in', 'not in']（推断）
// operator → null（重置）
// threshold → null（重置）

// 7. 设置 operator 和 threshold
atomicSetter.operator.value = 'IN';
atomicSetter.threshold.value = ['emp-001', 'emp-002'];

// 8. 验证并构建
if (atomicSetter.validate(atomicSetter.threshold.value)) {
  const rule = atomicSetter.build();
}

const group = ruleGroup.build();
```

## 目录结构

```shell
packages/core/src/
├── contracts/
│   ├── fetcher.ts    # Fetcher 接口定义
│   ├── dsl.ts        # DSL 类型定义
│   ├── rule.ts       # AtomicRule / RuleGroup 定义
│   └── index.ts
├── factory/
│   ├── fetcher.ts    # provideXXXFetcher 工厂函数
│   └── index.ts
├── resource/
│   ├── resource.ts   # ResponseResource 接口定义
│   └── index.ts
├── setter/
│   ├── AtomicRuleSetter.ts
│   ├── RuleGroupSetter.ts
│   ├── RuleSetter.ts
│   └── index.ts
└── index.ts          # 统一导出
```
