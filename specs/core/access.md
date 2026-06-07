# 接入层

对外暴露类型安全的 `API` 协议，简化业务方实例化内核应用层的过程

## 前置依赖

- [规则配置内核](./spec.md)
- [基础设施层](./infrastructure.md)
- [应用层](./application.md)

## Fetcher 工厂函数

通过 `provideXXXFetcher` 工厂函数创建类型安全的 `Fetcher` 注册项：

**重要**：不需传入 `resourceName`。一个 `Fetcher` 可被多个 `Resource` 复用，资源名称在调用时透传。

```ts
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

**与 `Fetcher` 调用约定的联动**：

```ts
const PAGINATED_FILTERABLE_FETCHER = providePaginatedFilterableFetcher<FieldDataSource>({
  fetch(resourceName, keyword, page, pageSize) {
    // resourceName 来源于 DSL `RuleFactorDefinition.resource.name`
    // 业务方可按 resourceName 路由到不同业务服务
    if (resourceName === 'Employee') return api.searchEmployees(keyword, page, pageSize);
    if (resourceName === 'Department') return api.searchDepartments(keyword, page, pageSize);
    throw new Error(`[sisyphus] Unknown resource: ${resourceName}`);
  },
});
```

## Builder Pattern 入口

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
