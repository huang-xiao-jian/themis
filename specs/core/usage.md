# Application Usage Example

## New Scenario

```ts
import { DataType, Mode, Quantity, SchedulerState } from '@sisyphus/core';
import { RuleWorkspaceBuilder, providePaginatedFilterableFetcher } from '@sisyphus/core';

// 1. Define the DSL
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

// 6. Drive form interactions through Formily Form (Formily effects handle inference linkage automatically)
// rule.form.name.value = 'employee'
// rule.form.operator.value = 'eq'
// rule.form.threshold.value = 100
// Formily effects automatically complete the factor switch -> operators / thresholder inference

// 7. Confirm the rule configuration and enter locked state (the Rule receives the confirmation command, and the Group writes state after internal validation passes)
rule.onOk();
// rule.state.value === SchedulerState.LOCKED

// 8. Validate and build (business validation runs during build)

// 9. Validate and build (business validation runs during build)
if (workspace.validate()) {
  const result = workspace.build();
  // Validation: at least 1 configured rule group, and each rule group contains at least 1 configured atomic rule
  // result: readonly AtomicRuleGroup[]
}

// 10. Edit an existing configuration (switch to editing state through onEdit)
rule.onEdit();
// Drive form changes through rule.form (Formily Form)
rule.onOk();

// 11. Rules can still be deleted in locked state
group.removeRule(rule.id); // deletion is not restricted by the locked state

// 12. Destroy the workspace and release subscriptions and caches
workspace.destroy();
```

## Editing Scenario

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
