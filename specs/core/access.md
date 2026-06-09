# Access Layer

Exposes a type-safe `API` contract to simplify instantiation of the core application layer for the application.

## Prerequisites

- [Core spec](./spec.md)
- [Infrastructure layer](./infrastructure.md)
- [Application layer](./application.md)

## Fetcher Factory Functions

Use the `provideXXXFetcher` factory functions to create type-safe `Fetcher` registrations:

**Important**: `resourceName` does not need to be passed in. One `Fetcher` can be reused by multiple `Resource`s, and the resource name is forwarded at call time.

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

**How this aligns with the `Fetcher` calling convention**:

```ts
const PAGINATED_FILTERABLE_FETCHER = providePaginatedFilterableFetcher<FieldDataSource>({
  fetch(resourceName, keyword, page, pageSize) {
    // resourceName comes from DSL `RuleFactorDefinition.resource.name`
    // The application can route to different backend services by resourceName
    if (resourceName === 'Employee') return api.searchEmployees(keyword, page, pageSize);
    if (resourceName === 'Department') return api.searchDepartments(keyword, page, pageSize);
    throw new Error(`[sisyphus] Unknown resource: ${resourceName}`);
  },
});
```

## Builder Pattern Entry Point

**Factory function vs Builder Pattern** responsibility boundary:

- `createRuleWorkspace`: a simplified one-stop entry point for creating a rule workspace, suitable for simple scenarios.
- `RuleWorkspaceBuilder`: a chainable configuration entry point, suitable for scenarios that need fine-grained control.

```ts
/**
 * Simplified factory function - one-stop creation (recommended for newcomers)
 */
function createRuleWorkspace(config: {
  factors: RuleFactorDefinition[];
  fetchers?: readonly FetcherProvider[];
  ruleGroups?: readonly AtomicRuleGroup[];
}): RuleWorkspaceScheduler;

/**
 * Builder Pattern - chainable configuration entry point (recommended standard scenario)
 */
class RuleWorkspaceBuilder {
  /**
   * Configure rule factor definitions (required)
   */
  withFactors(factors: RuleFactorDefinition[]): RuleWorkspaceBuilder;

  /**
   * Configure dynamic resource Fetchers (required for DynamicResource; StaticResource is provided by the core by default)
   */
  withFetchers(fetchers: readonly FetcherProvider[]): RuleWorkspaceBuilder;

  /**
   * Configure existing rule-group data (optional for editing scenarios, can be omitted for new scenarios)
   */
  withRuleGroups(ruleGroups: readonly AtomicRuleGroup[]): RuleWorkspaceBuilder;

  /**
   * Build the workspace scheduler
   */
  build(): RuleWorkspaceScheduler;
}
```
