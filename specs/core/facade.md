# Facade Layer

Expose a type-safe `API` contract.

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

## Example

### New Scenario

```ts
import { DataType, Mode, Quantity, SchedulerState } from '@thesis/core';
import { RuleWorkspaceBuilder, providePaginatedFilterableFetcher } from '@thesis/core';

// 1. Define the factors
// Multiple factors can share the same Fetcher for the same feature combination
// (for example, employee / department both use pagination + filtering)
const factors: RuleFactorDefinition[] = [
  {
    name: 'employee',
    title: 'Employee',
    dataType: DataType.STRING,
    resource: { name: 'Employee', features: ['pagination', 'filter'] },
  },
  {
    name: 'department',
    title: 'Department',
    dataType: DataType.STRING,
    resource: { name: 'Department', features: ['pagination', 'filter'] },
  },
  {
    name: 'deliver_city',
    title: 'Target City',
    dataType: DataType.STRING,
    resource: { name: 'City' }, // no features = StaticResource (provided by the core by default)
  },
  {
    name: 'order_amount',
    title: 'Order Amount',
    dataType: DataType.NUMBER,
    mode: Mode.RANGE,
    quantity: Quantity.MULTIPLE,
  },
];

// 2. Provide Fetchers (only required for DynamicResource; StaticResource is provided by the core by default)
// Fetchers are related only to features; resourceName is forwarded at call time
// The same Fetcher can be reused by Employee / Department
const fetchers = [
  providePaginatedFilterableFetcher({
    fetch(resourceName, keyword, page, pageSize) {
      switch (resourceName) {
        case 'Employee':
          return api.searchEmployees(keyword, page, pageSize);
        case 'Department':
          return api.searchDepartments(keyword, page, pageSize);
        default:
          throw new Error(`[sisyphus] Unknown resource: ${resourceName}`);
      }
    },
  }),
];

// 3. Build the RuleWorkspace
const workspace = new RuleWorkspaceBuilder().withFactors(factors).withFetchers(fetchers).build();

// 4. Create a rule group
const group = workspace.addGroup();

// 5. Create an atomic rule (a newly created Rule enters editing state by default)
const rule = group.addRule();
// rule.state.value === SchedulerState.EDITING
// rule.rule.value === null // draft: no confirmed snapshot yet

// 6. Drive form interactions through Formily Form (Formily effects handle inference linkage automatically)
// rule.form.name.value = 'employee'
// rule.form.operator.value = 'eq'
// rule.form.threshold.value = 100
// Formily effects automatically complete the factor switch -> operators / thresholder inference

// 7. Cancelling the first draft removes it directly instead of locking it
// rule.onCancel();
// group.pickRule(rule.id) === undefined

// 8. Re-create the rule and confirm it to enter locked state
const confirmedRule = group.addRule();
// confirmedRule.state.value === SchedulerState.EDITING
// confirmedRule.form.name.value = 'employee'
// confirmedRule.form.operator.value = 'eq'
// confirmedRule.form.threshold.value = 100

// 9. Confirm the rule configuration and enter locked state (the Rule receives the confirmation command, and the Group writes state after internal validation passes)
confirmedRule.onOk();
// confirmedRule.state.value === SchedulerState.LOCKED

// 10. Validate and build (business validation runs during build)

// 11. Validate and build (business validation runs during build)
if (workspace.validate()) {
  const result = workspace.build();
  // Validation: at least 1 configured rule group, and each rule group contains at least 1 configured atomic rule
  // result: readonly AtomicRuleGroup[]
}

// 12. Edit an existing configuration (switch to editing state through onEdit)
confirmedRule.onEdit();
// Drive form changes through confirmedRule.form (Formily Form)
// confirmedRule.onCancel(); // reverts to the last confirmed snapshot and exits editing
confirmedRule.onEdit();
confirmedRule.onOk();

// 13. Rules can still be deleted in locked state
group.removeRule(confirmedRule.id); // deletion is not restricted by the locked state

// 14. Destroy the workspace and release subscriptions and caches
workspace.destroy();
```

### Editing Scenario

```ts
// Existing rule-group data (loaded from outside)
import { AtomicRuleGroup, SchedulerState } from './spec.md';

const groups: AtomicRuleGroup[] = [
  {
    id: 'group-1',
    rules: [
      { id: 'rule-1', name: 'employee', operator: 'eq', threshold: 100 },
      { id: 'rule-2', name: 'deliver_city', operator: 'in', threshold: ['Beijing', 'Shanghai'] },
    ],
  },
];

// Pass existing data during initialization (factors / fetchers reuse the instances defined in the new scenario)
const workspace = new RuleWorkspaceBuilder()
  .withFactors(factors)
  .withFetchers(fetchers)
  .withRuleGroups(groups)
  .build();

// Get the rule group
const group = workspace.pickGroup('group-1');

const rule1 = group.pickRule('rule-1');
// rule1.state.value === SchedulerState.LOCKED

const rule2 = group.pickRule('rule-2');
// rule2.state.value === SchedulerState.LOCKED

// The user switches to editing state through onEdit
rule1.onEdit();
// Drive edits through rule1.form (Formily Form)
rule1.onOk();

// Parallel editing mutual exclusion in editing state (group-level constraint, independent of the workspace-level constraint)
rule1.onEdit(); // rule1 enters editing state
rule2.onEdit(); // rule2 enters editing state, rule1 is automatically locked
// rule1.state.value === SchedulerState.LOCKED
// rule2.state.value === SchedulerState.EDITING
// group.canAddRule.value === false (a rule is being edited, so adding is disabled)
```
