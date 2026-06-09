import { assert, describe, expect, it, vi } from 'vitest';
import { RuleWorkspaceBuilder } from './builder/RuleWorkspaceBuilder';
import type { RuleFactorDefinition } from './dsl';
import { DataType } from './dsl/DataType';
import { Mode } from './dsl/Mode';
import { Quantity } from './dsl/Quantity';
import { SchedulerState } from './dsl/SchedulerState';
import { provideElementaryFetcher } from './fetcher/provideElementaryFetcher';
import { providePaginatedFilterableFetcher } from './fetcher/providePaginatedFilterableFetcher';
import { createRuleWorkspace } from './index';

const factors: readonly RuleFactorDefinition[] = [
  {
    name: 'employee',
    title: '员工',
    dataType: DataType.STRING,
    resource: { name: 'Employee', features: ['pagination', 'filter'] },
  },
  {
    name: 'deliver_city',
    title: '目标城市',
    dataType: DataType.STRING,
    resource: { name: 'City' },
  },
  {
    name: 'order_amount',
    title: '订单金额',
    dataType: DataType.NUMBER,
    mode: Mode.RANGE,
    quantity: Quantity.MULTIPLE,
  },
  {
    name: 'is_active',
    title: '是否激活',
    dataType: DataType.BOOLEAN,
  },
];

const fetchers = [
  providePaginatedFilterableFetcher({
    fetch: vi.fn().mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0 }),
  }),
  provideElementaryFetcher({
    fetch: vi.fn().mockResolvedValue([
      { label: '北京', value: 'bj' },
      { label: '上海', value: 'sh' },
    ]),
  }),
];

describe('End-to-end: create scenario', () => {
  it('completes the full workflow: addGroup → addRule → form → onOk → lock', () => {
    const workspace = createRuleWorkspace({ factors, fetchers });

    // addGroup
    const group = workspace.addGroup()!;

    // addRule: new rule enters EDITING
    const rule = group.addRule()!;
    expect(rule.state.value).toBe(SchedulerState.EDITING);

    // Interact via Formily form
    rule.form.setValues({ name: 'order_amount' });
    expect(rule.form.values.name).toBe('order_amount');
    // number + range + multiple inference — results stay in form fields
    const $operator = rule.form.getFieldState('operator');
    assert($operator.dataSource);
    expect($operator.dataSource.map((o) => o.value)).toEqual([
      'between any',
      'between all',
      'not between any',
      'not between all',
    ]);
    const $threshold = rule.form.getFieldState('threshold');
    assert(Array.isArray($threshold.component));
    expect($threshold.component[1]).toMatchObject({ properties: { type: 'ListRangeBuilder' } });

    rule.form.setFieldState('operator', (s) => {
      s.value = 'between any';
    });
    rule.form.setFieldState('threshold', (s) => {
      s.value = [
        [0, 100],
        [200, 300],
      ];
    });

    // onOk: confirm rule → locks
    rule.onOk();
    expect(rule.state.value).toBe(SchedulerState.LOCKED);
    expect(rule.rule.value).toEqual({
      id: rule.id,
      name: 'order_amount',
      operator: 'between any',
      threshold: [
        [0, 100],
        [200, 300],
      ],
    });

    // validate & build
    expect(workspace.validate()).toBe(true);
    const result = workspace.build();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(group.id);
    expect(result[0].rules).toHaveLength(1);

    // destroy
    expect(() => workspace.destroy()).not.toThrow();
    expect(() => workspace.destroy()).not.toThrow();
  });
});

describe('End-to-end: edit scenario', () => {
  const editGroups = [
    {
      id: 'group-1',
      rules: [
        { id: 'rule-1', name: 'is_active', operator: 'is', threshold: true },
        { id: 'rule-2', name: 'order_amount', operator: 'between any', threshold: [[0, 100]] },
      ],
    },
  ];

  it('restores from snapshots in LOCKED state', () => {
    const workspace = new RuleWorkspaceBuilder()
      .withFactors(factors)
      .withFetchers(fetchers)
      .withRuleGroups(editGroups)
      .build();

    const group = workspace.groups.value[0];
    expect(group.rules.value).toHaveLength(2);
    expect(group.rules.value[0].state.value).toBe(SchedulerState.LOCKED);
    expect(group.rules.value[0].rule.value).toEqual(editGroups[0].rules[0]);
  });

  it('onEdit allows editing, then onOk locks back', () => {
    const workspace = new RuleWorkspaceBuilder()
      .withFactors(factors)
      .withFetchers(fetchers)
      .withRuleGroups(editGroups)
      .build();

    const group = workspace.groups.value[0];
    const rule = group.rules.value[0];
    rule.onEdit();
    expect(rule.state.value).toBe(SchedulerState.EDITING);
    expect(rule.form.pattern).toBe('editable');

    // Modify via form
    rule.form.setValues({ name: 'order_amount' });
    rule.form.setFieldState('operator', (s) => {
      s.value = 'between any';
    });
    rule.form.setFieldState('threshold', (s) => {
      s.value = [[0, 100]];
    });
    rule.onOk();
    expect(rule.state.value).toBe(SchedulerState.LOCKED);
  });

  it('build returns restored data without modifications', () => {
    const workspace = new RuleWorkspaceBuilder()
      .withFactors(factors)
      .withFetchers(fetchers)
      .withRuleGroups(editGroups)
      .build();

    const result = workspace.build();
    expect(result[0].rules).toEqual(editGroups[0].rules);
  });
});

describe('End-to-end: mutual exclusion', () => {
  it('parallel editing mutex at Rule level', () => {
    const workspace = createRuleWorkspace({
      factors,
      fetchers,
      ruleGroups: [
        {
          id: 'group-1',
          rules: [
            { id: 'rule-1', name: 'is_active', operator: 'is', threshold: true },
            { id: 'rule-2', name: 'order_amount', operator: 'between any', threshold: [[0, 100]] },
          ],
        },
      ],
    });

    const group = workspace.groups.value[0];

    // Edit rule-1
    const rule1 = group.rules.value[0];
    rule1.onEdit();
    expect(rule1.state.value).toBe(SchedulerState.EDITING);

    // Switch to rule-2 → rule-1 auto-locks
    const rule2 = group.rules.value[1];
    rule2.onEdit();
    expect(rule1.state.value).toBe(SchedulerState.LOCKED);
    expect(rule2.state.value).toBe(SchedulerState.EDITING);
    expect(group.canAddRule.value).toBe(false);
  });

  it('canAddGroup is false when empty-rule group exists', () => {
    const workspace = createRuleWorkspace({
      factors,
      fetchers,
    });

    // addGroup creates an empty group, which blocks canAddGroup
    workspace.addGroup();
    expect(workspace.canAddGroup.value).toBe(false);
  });
});

describe('End-to-end: removeRule in LOCKED state', () => {
  it('removeRule works regardless of state', () => {
    const workspace = createRuleWorkspace({
      factors,
      fetchers,
      ruleGroups: [
        {
          id: 'group-1',
          rules: [{ id: 'rule-1', name: 'is_active', operator: 'is', threshold: true }],
        },
      ],
    });

    const group = workspace.groups.value[0];
    group.removeRule('rule-1');
    expect(group.rules.value).toEqual([]);
  });
});
