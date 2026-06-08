import { describe, expect, it, vi } from 'vitest';
import { ALL_FACTORS } from '../__fixtures__/factors';
import { SAMPLE_GROUP } from '../__fixtures__/rules';
import { SchedulerState } from '../dsl/SchedulerState';
import { TransitionEventType } from '../dsl/TransitionEventType';
import { DefaultDynamicResourceFactory } from '../factory/DynamicResourceFactory';
import { FetcherRegistry } from '../factory/FetcherRegistry';
import { DefaultResourceFactory } from '../factory/ResourceFactory';
import { DefaultStaticResourceFactory } from '../factory/StaticResourceFactory';
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
    operator: new OperatorInferrer(),
    thresholder: new ThresholderInferrer(factory),
  };
}

function makeGroup(editingGroupId?: string | null, snapshot?: typeof SAMPLE_GROUP) {
  const coordination = createWorkspaceCoordination(ALL_FACTORS);
  coordination.editingGroupId.value = editingGroupId ?? null;
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
    expect(group.factors.value).toHaveLength(ALL_FACTORS.length);
    expect(group.snapshots).toEqual([]);
  });

  it('restores rules from snapshot', () => {
    const group = makeGroup(null, SAMPLE_GROUP);
    expect(group.snapshots).toHaveLength(2);
    expect(group.rules.value).toHaveLength(2);
    expect(group.rules.value[0]).toBeInstanceOf(AtomicRuleScheduler);
    expect(group.rules.value[0].id).toBe('rule-1');
  });

  it('state is LOCKED by default when editingGroupId does not match', () => {
    const group = makeGroup(null);
    expect(group.state.value).toBe(SchedulerState.LOCKED);
    expect(group.editable.value).toBe(false);
  });

  it('state is EDITING when editingGroupId matches', () => {
    const group = makeGroup('group-1');
    expect(group.state.value).toBe(SchedulerState.EDITING);
    expect(group.editable.value).toBe(true);
  });

  it('coordination.editingRuleId is null by default', () => {
    const group = makeGroup();
    expect(group.coordination.editingRuleId.value).toBeNull();
  });
});

describe('AtomicRuleGroupScheduler - addRule', () => {
  it('addRule creates a new rule and sets editingRuleId', () => {
    const group = makeGroup('group-1');
    const rule = group.addRule();
    expect(rule).toBeInstanceOf(AtomicRuleScheduler);
    expect(group.rules.value).toHaveLength(1);
    expect(group.coordination.editingRuleId.value).toBe(rule!.id);
  });

  it('addRule returns undefined when not in EDITING state', () => {
    const group = makeGroup(null); // LOCKED
    const result = group.addRule();
    expect(result).toBeUndefined();
    expect(group.rules.value).toEqual([]);
  });

  it('addRule mutex: second addRule auto-locks first rule', () => {
    const group = makeGroup('group-1');
    const rule1 = group.addRule()!;
    expect(group.coordination.editingRuleId.value).toBe(rule1.id);
    // Lock rule1 via transitionState first to allow second addRule
    group.transitionState(rule1.id, SchedulerState.LOCKED);
    const rule2 = group.addRule()!;
    expect(group.coordination.editingRuleId.value).toBe(rule2.id);
    expect(rule1.state.value).toBe(SchedulerState.LOCKED);
  });
});

describe('AtomicRuleGroupScheduler - canAddRule', () => {
  it('canAddRule is true when no rules and no editing rule', () => {
    const group = makeGroup('group-1');
    expect(group.canAddRule.value).toBe(true);
  });

  it('canAddRule is false when editing rule exists', () => {
    const group = makeGroup('group-1');
    group.addRule();
    expect(group.canAddRule.value).toBe(false);
  });

  it('canAddRule is true after locking the editing rule', () => {
    const group = makeGroup('group-1');
    const rule = group.addRule()!;
    group.transitionState(rule.id, SchedulerState.LOCKED);
    expect(group.canAddRule.value).toBe(true);
  });
});

describe('AtomicRuleGroupScheduler - transitionState', () => {
  it('transitionState to EDITING sets editingRuleId', () => {
    const group = makeGroup('group-1');
    const rule = group.addRule()!;
    group.transitionState(rule.id, SchedulerState.LOCKED);
    group.transitionState(rule.id, SchedulerState.EDITING);
    expect(group.coordination.editingRuleId.value).toBe(rule.id);
    expect(rule.state.value).toBe(SchedulerState.EDITING);
  });

  it('transitionState to LOCKED clears editingRuleId', () => {
    const group = makeGroup('group-1');
    const rule = group.addRule()!;
    group.transitionState(rule.id, SchedulerState.LOCKED);
    expect(group.coordination.editingRuleId.value).toBeNull();
    expect(rule.state.value).toBe(SchedulerState.LOCKED);
  });

  it('transitionState mutex: switching to EDITING auto-locks previous', () => {
    const group = makeGroup('group-1');
    const rule1 = group.addRule()!;
    group.transitionState(rule1.id, SchedulerState.LOCKED);
    const rule2 = group.addRule()!;
    group.transitionState(rule2.id, SchedulerState.LOCKED);
    // Now both locked, switch rule1 to editing
    group.transitionState(rule1.id, SchedulerState.EDITING);
    expect(rule1.state.value).toBe(SchedulerState.EDITING);
    // Switch rule2 to editing → rule1 auto-locks
    group.transitionState(rule2.id, SchedulerState.EDITING);
    expect(rule1.state.value).toBe(SchedulerState.LOCKED);
    expect(rule2.state.value).toBe(SchedulerState.EDITING);
  });
});

describe('AtomicRuleGroupScheduler - event handling', () => {
  it('Rule onOk locks the editing rule', () => {
    const group = makeGroup('group-1');
    const rule = group.addRule()!;
    // Must create fields to activate reactions
    rule.form.createField({ name: 'name' });
    rule.form.createField({ name: 'operator' });
    rule.form.createField({ name: 'threshold' });
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

  it('Rule onCancel locks the editing rule', () => {
    const group = makeGroup('group-1');
    const rule = group.addRule()!;
    rule.onCancel();
    expect(group.coordination.editingRuleId.value).toBeNull();
  });

  it('Group onOk emits OK event to parent (workspace coordination bus)', () => {
    const workspaceCoordination = createWorkspaceCoordination(ALL_FACTORS);
    workspaceCoordination.editingGroupId.value = 'group-1';
    const group = makeGroupWithCoordination(workspaceCoordination);
    const handler = vi.fn();
    workspaceCoordination.bus.on(TransitionEventType.OK, handler);
    // Add and confirm a rule
    const rule = group.addRule()!;
    // Must create fields to activate reactions
    rule.form.createField({ name: 'name' });
    rule.form.createField({ name: 'operator' });
    rule.form.createField({ name: 'threshold' });
    rule.form.setValues({ name: 'is_active' });
    rule.form.setFieldState('operator', (s) => {
      s.value = 'is';
    });
    rule.form.setFieldState('threshold', (s) => {
      s.value = true;
    });
    rule.onOk();
    group.onOk();
    expect(handler).toHaveBeenCalledWith({
      type: TransitionEventType.OK,
      sourceId: 'group-1',
    });
  });
});

describe('AtomicRuleGroupScheduler - removeRule', () => {
  it('removeRule works in any state', () => {
    const group = makeGroup('group-1');
    const rule = group.addRule()!;
    group.removeRule(rule.id);
    expect(group.rules.value).toEqual([]);
  });

  it('removeRule clears editingRuleId if removed rule was editing', () => {
    const group = makeGroup('group-1');
    const rule = group.addRule()!;
    expect(group.coordination.editingRuleId.value).toBe(rule.id);
    group.removeRule(rule.id);
    expect(group.coordination.editingRuleId.value).toBeNull();
  });
});

describe('AtomicRuleGroupScheduler - hydrateRule', () => {
  it('hydrateRule restores rule in LOCKED state', () => {
    const group = makeGroup('group-1');
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

describe('AtomicRuleGroupScheduler - validate & build', () => {
  it('validate returns false when no rules', () => {
    const group = makeGroup('group-1');
    expect(group.validate()).toBe(false);
  });

  it('validate returns true when all rules are confirmed', () => {
    const group = makeGroup(null, SAMPLE_GROUP);
    expect(group.validate()).toBe(true);
  });

  it('build throws when incomplete', () => {
    const group = makeGroup('group-1');
    expect(() => group.build()).toThrow(/incomplete/);
  });

  it('build returns AtomicRuleGroup when valid', () => {
    const group = makeGroup(null, SAMPLE_GROUP);
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
    const group = makeGroup('group-1');
    group.destroy();
    expect(() => group.addRule()).toThrow(/destroyed/);
  });
});
