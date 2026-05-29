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
/** 表单字段标识 */
type FieldName = 'name' | 'operator' | 'threshold';

/** 表单字段变更 Action */
interface FieldChangeAction {
  field: FieldName;
  value: unknown;
}

/** 原子规则初始化数据（编辑场景） */
interface AtomicRuleInit {
  /** 规则标识 */
  readonly id: string;
  /** 规则因子名称 */
  readonly factorName: string;
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
  /** 响应式资源（供适配层使用） */
  readonly resource: Signal<ResponseResource | null>;

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

  /** 创建原子规则设置器（新建场景） */
  add(ruleId: string): AtomicRuleSetter;
  /** 创建原子规则设置器（编辑场景） */
  add(ruleId: string, init: AtomicRuleInit): AtomicRuleSetter;
  /** 移除原子规则 */
  remove(ruleId: string): void;
  /** 验证所有原子规则 */
  validate(): boolean;
  /** 构建规则组 */
  build(): RuleGroup;
}
```

### RuleSetter - 统一入口

使用 Builder Pattern 实例化：

```ts
class RuleSetterBuilder {
  /** 添加规则因子定义 */
  withFactors(factors: RuleFactorDefinition[]): RuleSetterBuilder;
  /** 添加 Fetcher */
  withFetchers(fetchers: readonly FetcherProvider[]): RuleSetterBuilder;
  /** 添加已有规则（编辑场景可选） */
  withRules(rules: readonly AtomicRule[]): RuleSetterBuilder;
  /** 构建 RuleSetter 实例 */
  build(): RuleSetter;
}

interface RuleSetter {
  /** 已创建的规则组列表 */
  readonly ruleGroups: Signal<readonly RuleGroup[]>;
  /** 已注册的规则（编辑场景填充，新建场景为空） */
  readonly rules: Signal<readonly AtomicRule[]>;

  /** 创建规则组设置器 */
  addGroup(groupId: string): RuleGroupSetter;
  removeGroup(groupId: string): void;
  /** 验证所有规则组 */
  validate(): boolean;
  /** 构建所有规则组 */
  build(): readonly RuleGroup[];
}
```

## 业务方使用示例

### 新建场景

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

// 2. 提供 Fetcher
const fetchers = [
  providePaginatedFilterableFetcher({
    fetch(keyword, page, pageSize) {
      return api.searchEmployees(keyword, page, pageSize);
    },
  }),
  // 注：StaticResource 无需 Fetcher，预设选项直接赋值
];

// 1. 通过 Builder 链式调用
const ruleSetter = new RuleSetterBuilder().withFactors(factors).withFetchers(fetchers).build();

// 4. 创建规则组
const ruleGroup = ruleSetter.addGroup('group-001');

// 5. 创建原子规则
const atomicSetter = ruleGroup.add('rule-001');

// 6. 切换规则因子（自动重置 operator/threshold）
atomicSetter.onFieldChange({ field: 'name', value: 'employee' });

// factor → employee 定义
// operators → ['=', '≠', 'in', 'not in']（推断）
// operator → null（重置）
// threshold → null（重置）

// 7. 设置 operator 和 threshold
atomicSetter.onFieldChange({ field: 'operator', value: 'IN' });
atomicSetter.onFieldChange({ field: 'threshold', value: ['emp-001', 'emp-002'] });

// 8. 验证并构建
if (atomicSetter.validate()) {
  const rule = atomicSetter.build();
}

const group = ruleGroup.build();
```

### 编辑场景

```ts
// 1. 从已有规则创建配置器
const existingRules: AtomicRule[] = [
  {
    id: 'rule-001',
    factor: { name: 'employee', title: '员工', dataType: 'string', ... },
    operator: 'IN',
    threshold: ['emp-001', 'emp-002'],
  },
];


// 2. 通过 Builder 链式调用
const ruleSetter = new RuleSetterBuilder()
  .withFactors(factors)
  .withFetchers(fetchers)
  .withRules(existingRules)
  .build();


// 3. 获取规则组
const ruleGroup = ruleSetter.addGroup('group-001');

// 4. 编辑已有规则
const atomicSetter = ruleGroup.add('rule-001', {
  id: 'rule-001',
  factorName: 'employee',
  operator: 'IN',
  threshold: ['emp-003'],
});

// 5. 修改阈值
atomicSetter.onFieldChange({ field: 'threshold', value: ['emp-003', 'emp-004'] });


// 6. 验证并构建
if (atomicSetter.validate()) {
  const rule = atomicSetter.build();
}
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
