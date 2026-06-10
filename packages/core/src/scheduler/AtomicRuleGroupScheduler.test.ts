import { describe, expect, it, vi } from 'vitest';
import { ALL_FACTORS } from '../__fixtures__/factors';
import { SAMPLE_GROUP } from '../__fixtures__/rules';
import { SchedulerState } from '../dsl/SchedulerState';
import { WorkspaceCoordinationEventType } from '../dsl/WorkspaceCoordinationEventType';
import { DefaultDynamicResourceFactory } from '../factory/DynamicResourceFactory';
import { FetcherRegistry } from '../factory/FetcherRegistry';
import { DefaultResourceFactory } from '../factory/ResourceFactory';
import { DefaultStaticResourceFactory } from '../factory/StaticResourceFactory';
import { FactorInferrer } from '../inferrer/FactorInferrer';
import { OperatorInferrer } from '../inferrer/OperatorInferrer';
import { ThresholderInferrer } from '../inferrer/ThresholderInferrer';
import { AtomicRuleGroupScheduler } from './AtomicRuleGroupScheduler';
import { AtomicRuleScheduler } from './AtomicRuleScheduler';
import { createWorkspaceCoordination, type WorkspaceCoordination } from './Coordination';

function makeInferrers() {
  const factory = new DefaultResourceFactory(
    new DefaultStaticResourceFactory(),
    new DefaultDynamicResourceFactory(new FetcherRegistry())
  );
  return {
    factor: new FactorInferrer(ALL_FACTORS),
    operator: new OperatorInferrer(),
    thresholder: new ThresholderInferrer(factory),
  };
}

function makeGroup(snapshot?: typeof SAMPLE_GROUP) {
  const coordination = createWorkspaceCoordination(ALL_FACTORS);
  return new AtomicRuleGroupScheduler('group-1', coordination, makeInferrers(), snapshot);
}

function makeGroupWithCoordination(
  workspaceCoordination: WorkspaceCoordination,
  snapshot?: typeof SAMPLE_GROUP
) {
  return new AtomicRuleGroupScheduler('group-1', workspaceCoordination, makeInferrers(), snapshot);
}

describe('AtomicRuleGroupScheduler - creation', () => {
  it('starts with empty rules and full factors', () => {
    const group = makeGroup();
    expect(group.id).toBe('group-1');
    expect(group.rules.value).toEqual([]);
    expect(group.coordination.factors.value).toHaveLength(ALL_FACTORS.length);
  });

  it('restores rules from snapshot', () => {
    const group = makeGroup(SAMPLE_GROUP);
    expect(group.rules.value).toHaveLength(2);
    expect(group.rules.value[0]).toBeInstanceOf(AtomicRuleScheduler);
    expect(group.rules.value[0].id).toBe('rule-1');
  });

  it('coordination.editingRuleId is null by default', () => {
    const group = makeGroup();
    expect(group.coordination.editingRuleId.value).toBeNull();
  });
});

describe('AtomicRuleGroupScheduler - addRule', () => {
  it('addRule creates a new rule and sets editingRuleId', () => {
    const group = makeGroup();
    const rule = group.addRule();
    expect(rule).toBeInstanceOf(AtomicRuleScheduler);
    expect(group.rules.value).toHaveLength(1);
    expect(group.coordination.editingRuleId.value).toBe(rule!.id);
  });

  it('addRule mutex: second addRule auto-locks first rule', () => {
    const group = makeGroup();
    const rule1 = group.addRule()!;
    expect(group.coordination.editingRuleId.value).toBe(rule1.id);
    // Lock rule1 via onOk first to allow second addRule
    rule1.form.setValues({ name: 'is_active' });
    rule1.form.setFieldState('operator', (s) => {
      s.value = 'is';
    });
    rule1.form.setFieldState('threshold', (s) => {
      s.value = true;
    });
    rule1.onOk();
    const rule2 = group.addRule()!;
    expect(group.coordination.editingRuleId.value).toBe(rule2.id);
    expect(rule1.state.value).toBe(SchedulerState.LOCKED);
  });
});

describe('AtomicRuleGroupScheduler - canAddRule', () => {
  it('canAddRule is true when no rules and no editing rule', () => {
    const group = makeGroup();
    expect(group.canAddRule.value).toBe(true);
  });

  it('canAddRule is false when editing rule exists', () => {
    const group = makeGroup();
    group.addRule();
    expect(group.canAddRule.value).toBe(false);
  });

  it('canAddRule is true after locking the editing rule', () => {
    const group = makeGroup();
    const rule = group.addRule()!;
    rule.onCancel();
    expect(group.canAddRule.value).toBe(true);
  });
});

describe('AtomicRuleGroupScheduler - event handling', () => {
  it('Rule onEdit sets editingRuleId', () => {
    const group = makeGroup();
    const rule = group.addRule()!;
    rule.form.setValues({ name: 'is_active' });
    rule.form.setFieldState('operator', (s) => {
      s.value = 'is';
    });
    rule.form.setFieldState('threshold', (s) => {
      s.value = true;
    });
    rule.onOk();
    rule.onEdit();
    expect(group.coordination.editingRuleId.value).toBe(rule.id);
    expect(rule.state.value).toBe(SchedulerState.EDITING);
  });

  it('Rule onCancel removes a draft rule instead of locking it', () => {
    const group = makeGroup();
    const rule = group.addRule()!;
    rule.onCancel();
    expect(group.coordination.editingRuleId.value).toBeNull();
    expect(group.rules.value).toEqual([]);
    expect(group.pickRule(rule.id)).toBeUndefined();
  });

  it('Rule onEdit mutex: switching to EDITING auto-locks previous', () => {
    const group = makeGroup();
    const rule1 = group.addRule()!;
    rule1.form.setValues({ name: 'is_active' });
    rule1.form.setFieldState('operator', (s) => {
      s.value = 'is';
    });
    rule1.form.setFieldState('threshold', (s) => {
      s.value = true;
    });
    rule1.onOk();
    const rule2 = group.addRule()!;
    rule2.form.setValues({ name: 'employee' });
    rule2.form.setFieldState('operator', (s) => {
      s.value = 'eq';
    });
    rule2.form.setFieldState('threshold', (s) => {
      s.value = 100;
    });
    rule2.onOk();
    // Now both locked, switch rule1 to editing
    rule1.onEdit();
    expect(rule1.state.value).toBe(SchedulerState.EDITING);
    // Switch rule2 to editing → rule1 auto-locks
    rule2.onEdit();
    expect(rule1.state.value).toBe(SchedulerState.LOCKED);
    expect(rule2.state.value).toBe(SchedulerState.EDITING);
  });
  it('Rule onOk locks the editing rule', () => {
    const group = makeGroup();
    const rule = group.addRule()!;
    // Set up valid rule data
    rule.form.setValues({ name: 'is_active' });
    rule.form.setFieldState('operator', (s) => {
      s.value = 'is';
    });
    rule.form.setFieldState('threshold', (s) => {
      s.value = true;
    });
    rule.onOk();
    expect(group.coordination.editingRuleId.value).toBeNull();
    expect(rule.state.value).toBe(SchedulerState.LOCKED);
  });

  it('Rule onCancel keeps a confirmed rule and exits editing state', () => {
    const group = makeGroup();
    const rule = group.addRule()!;

    rule.form.setValues({ name: 'is_active' });
    rule.form.setFieldState('operator', (s) => {
      s.value = 'is';
    });
    rule.form.setFieldState('threshold', (s) => {
      s.value = true;
    });
    rule.onOk();
    rule.onEdit();
    rule.onCancel();

    expect(group.coordination.editingRuleId.value).toBeNull();
    expect(group.pickRule(rule.id)).toBe(rule);
    expect(rule.state.value).toBe(SchedulerState.LOCKED);
  });

  it('Group onRemove emits REMOVE event', () => {
    const workspaceCoordination = createWorkspaceCoordination(ALL_FACTORS);
    const group = makeGroupWithCoordination(workspaceCoordination);
    const handler = vi.fn();
    workspaceCoordination.bus.on(WorkspaceCoordinationEventType.REMOVE, handler);
    group.onRemove();
    expect(handler).toHaveBeenCalledWith({
      type: WorkspaceCoordinationEventType.REMOVE,
      sourceId: 'group-1',
    });
  });

  it('Rule onRemove triggers removeRule in parent group', () => {
    const group = makeGroup();
    const rule = group.addRule()!;
    rule.onRemove();
    expect(group.rules.value).toEqual([]);
  });
});

describe('AtomicRuleGroupScheduler - removeRule', () => {
  it('removeRule works in any state', () => {
    const group = makeGroup();
    const rule = group.addRule()!;
    group.removeRule(rule.id);
    expect(group.rules.value).toEqual([]);
  });

  it('removeRule clears editingRuleId if removed rule was editing', () => {
    const group = makeGroup();
    const rule = group.addRule()!;
    expect(group.coordination.editingRuleId.value).toBe(rule.id);
    group.removeRule(rule.id);
    expect(group.coordination.editingRuleId.value).toBeNull();
  });
});

describe('AtomicRuleGroupScheduler - hydrateRule', () => {
  it('hydrateRule restores rule in LOCKED state', () => {
    const group = makeGroup();
    group.hydrateRule({ id: 'rule-1', name: 'is_active', operator: 'is', threshold: true });
    const rule = group.rules.value[0];
    expect(rule.state.value).toBe(SchedulerState.LOCKED);
    expect(rule.rule.value).toEqual({
      id: 'rule-1',
      name: 'is_active',
      operator: 'is',
      threshold: true,
    });
  });
});

describe('AtomicRuleGroupScheduler - factor uniqueness', () => {
  it('confirmed rule factor is marked disabled in coordination.factors', () => {
    const group = makeGroup();
    const rule = group.addRule()!;

    // 确认规则前，所有因子均可用
    const before = group.coordination.factors.value;
    expect(before.every((f) => !f.disabled)).toBe(true);

    // 配置并确认规则
    rule.form.setValues({ name: 'is_active' });
    rule.form.setFieldState('operator', (s) => {
      s.value = 'is';
    });
    rule.form.setFieldState('threshold', (s) => {
      s.value = true;
    });
    rule.onOk();

    // 确认后可用因子中 is_active 应被标记 disabled
    const after = group.coordination.factors.value;
    const disabledItem = after.find((f) => f.value === 'is_active');
    expect(disabledItem?.disabled).toBe(true);
  });

  it('snapshot-restored rule factor is marked disabled', () => {
    const group = makeGroup(SAMPLE_GROUP);
    const factors = group.coordination.factors.value;
    // SAMPLE_GROUP 中包含 employee 和 deliver_city 两条规则
    const employee = factors.find((f) => f.value === 'employee');
    const deliverCity = factors.find((f) => f.value === 'deliver_city');
    expect(employee?.disabled).toBe(true);
    expect(deliverCity?.disabled).toBe(true);
  });
});

describe('AtomicRuleGroupScheduler - validate & build', () => {
  it('validate returns false when no rules', () => {
    const group = makeGroup();
    expect(group.validate()).toBe(false);
  });

  it('validate returns true when all rules are confirmed', () => {
    const group = makeGroup(SAMPLE_GROUP);
    expect(group.validate()).toBe(true);
  });

  it('build throws when incomplete', () => {
    const group = makeGroup();
    expect(() => group.build()).toThrow(/incomplete/);
  });

  it('build returns AtomicRuleGroup when valid', () => {
    const group = makeGroup(SAMPLE_GROUP);
    const result = group.build();
    expect(result.id).toBe('group-1');
    expect(result.rules).toHaveLength(2);
  });
});

describe('AtomicRuleGroupScheduler - destroy', () => {
  it('destroy is idempotent', () => {
    const group = makeGroup();
    group.destroy();
    expect(() => group.destroy()).not.toThrow();
  });

  it('addRule throws after destroy', () => {
    const group = makeGroup();
    group.destroy();
    expect(() => group.addRule()).toThrow(/destroyed/);
  });
});
