import { describe, expect, it, vi } from 'vitest';
import { ALL_FACTORS } from '../__fixtures__/factors';
import { SAMPLE_GROUP } from '../__fixtures__/rules';
import { SchedulerState } from '../dsl/SchedulerState';
import { DefaultDynamicResourceFactory } from '../factory/DynamicResourceFactory';
import { FetcherRegistry } from '../factory/FetcherRegistry';
import { DefaultResourceFactory } from '../factory/ResourceFactory';
import { DefaultStaticResourceFactory } from '../factory/StaticResourceFactory';
import { OperatorInferrer } from '../inferrer/OperatorInferrer';
import { ThresholderInferrer } from '../inferrer/ThresholderInferrer';
import { AtomicRuleGroupScheduler } from './AtomicRuleGroupScheduler';
import { RuleWorkspaceScheduler } from './RuleWorkspaceScheduler';

function makeInferrers() {
  const factory = new DefaultResourceFactory(
    new DefaultStaticResourceFactory(),
    new DefaultDynamicResourceFactory(new FetcherRegistry())
  );
  return {
    operatorInferrer: new OperatorInferrer(),
    thresholderInferrer: new ThresholderInferrer(factory),
  };
}

function makeWorkspace(snapshots?: readonly (typeof SAMPLE_GROUP)[]) {
  return new RuleWorkspaceScheduler(ALL_FACTORS, makeInferrers(), snapshots);
}

describe('RuleWorkspaceScheduler - creation', () => {
  it('starts with empty groups when no snapshots', () => {
    const workspace = makeWorkspace();
    expect(workspace.snapshots).toEqual([]);
    expect(workspace.groups.value).toEqual([]);
  });

  it('restores groups from snapshots', () => {
    const workspace = makeWorkspace([SAMPLE_GROUP]);
    expect(workspace.snapshots).toHaveLength(1);
    expect(workspace.groups.value).toHaveLength(1);
    expect(workspace.groups.value[0]).toBeInstanceOf(AtomicRuleGroupScheduler);
  });

  it('editingGroupId is null by default', () => {
    const workspace = makeWorkspace();
    expect(workspace.editingGroupId.value).toBeNull();
  });
});

describe('RuleWorkspaceScheduler - addGroup', () => {
  it('addGroup creates a new group and sets editingGroupId', () => {
    const workspace = makeWorkspace();
    const group = workspace.addGroup();
    expect(group).toBeInstanceOf(AtomicRuleGroupScheduler);
    expect(workspace.groups.value).toHaveLength(1);
    expect(workspace.editingGroupId.value).toBe(group!.id);
    expect(group!.state.value).toBe(SchedulerState.EDITING);
  });

  it('addGroup returns undefined when canAddGroup is false', () => {
    const workspace = makeWorkspace();
    workspace.addGroup(); // first group (editing)
    const result = workspace.addGroup(); // second should fail (editing group exists)
    expect(result).toBeUndefined();
    expect(workspace.groups.value).toHaveLength(1);
  });

  it('addGroup throws after destroy', () => {
    const workspace = makeWorkspace();
    workspace.destroy();
    expect(() => workspace.addGroup()).toThrow(/destroyed/);
  });
});

describe('RuleWorkspaceScheduler - canAddGroup', () => {
  it('canAddGroup is true when no groups', () => {
    const workspace = makeWorkspace();
    expect(workspace.canAddGroup.value).toBe(true);
  });

  it('canAddGroup is false when editing group exists', () => {
    const workspace = makeWorkspace();
    workspace.addGroup();
    expect(workspace.canAddGroup.value).toBe(false);
  });

  it('canAddGroup is false when empty-rule group exists', () => {
    const workspace = makeWorkspace();
    const group = workspace.addGroup()!;
    // Lock the group but it has no rules
    workspace.transitionState(group.id, SchedulerState.LOCKED);
    expect(workspace.canAddGroup.value).toBe(false);
  });

  it('canAddGroup is true when locked group has confirmed rules', () => {
    const workspace = makeWorkspace([SAMPLE_GROUP]);
    expect(workspace.canAddGroup.value).toBe(true);
  });
});

describe('RuleWorkspaceScheduler - transitionState', () => {
  it('transitionState to EDITING sets editingGroupId', () => {
    const workspace = makeWorkspace([SAMPLE_GROUP]);
    workspace.transitionState('group-1', SchedulerState.EDITING);
    expect(workspace.editingGroupId.value).toBe('group-1');
    expect(workspace.groups.value[0].state.value).toBe(SchedulerState.EDITING);
  });

  it('transitionState to LOCKED clears editingGroupId and cascades', () => {
    const workspace = makeWorkspace();
    const group = workspace.addGroup()!;
    const rule = group.addRule()!;
    // Both in editing
    expect(group.state.value).toBe(SchedulerState.EDITING);
    expect(rule.state.value).toBe(SchedulerState.EDITING);
    // Lock the group
    workspace.transitionState(group.id, SchedulerState.LOCKED);
    expect(workspace.editingGroupId.value).toBeNull();
    expect(group.state.value).toBe(SchedulerState.LOCKED);
    expect(group.editingRuleId.value).toBeNull();
    expect(rule.state.value).toBe(SchedulerState.LOCKED);
  });
});

describe('RuleWorkspaceScheduler - event handling', () => {
  it('Group onOk locks the editing group and cascades', () => {
    const workspace = makeWorkspace();
    const group = workspace.addGroup()!;
    const rule = group.addRule()!;
    // Confirm the rule
    rule.form.setValues({ name: 'is_active' });
    rule.form.setFieldState('operator', (s) => {
      s.value = 'is';
    });
    rule.form.setFieldState('threshold', (s) => {
      s.value = true;
    });
    rule.onOk();
    // Confirm the group
    group.onOk();
    expect(workspace.editingGroupId.value).toBeNull();
    expect(group.state.value).toBe(SchedulerState.LOCKED);
    expect(group.editingRuleId.value).toBeNull();
    expect(rule.state.value).toBe(SchedulerState.LOCKED);
  });

  it('Group onEdit sets editingGroupId', () => {
    const workspace = makeWorkspace([SAMPLE_GROUP]);
    const group = workspace.groups.value[0];
    group.onEdit();
    expect(workspace.editingGroupId.value).toBe('group-1');
    expect(group.state.value).toBe(SchedulerState.EDITING);
  });
});

describe('RuleWorkspaceScheduler - removeGroup', () => {
  it('removeGroup destroys and removes the group', () => {
    const workspace = makeWorkspace();
    const group = workspace.addGroup()!;
    workspace.removeGroup(group.id);
    expect(workspace.groups.value).toEqual([]);
  });

  it('removeGroup clears editingGroupId if removed group was editing', () => {
    const workspace = makeWorkspace();
    const group = workspace.addGroup()!;
    expect(workspace.editingGroupId.value).toBe(group.id);
    workspace.removeGroup(group.id);
    expect(workspace.editingGroupId.value).toBeNull();
  });

  it('removeGroup on non-existent id is a no-op', () => {
    const workspace = makeWorkspace();
    expect(() => workspace.removeGroup('nope')).not.toThrow();
  });
});

describe('RuleWorkspaceScheduler - hydrateGroup', () => {
  it('hydrateGroup restores group in LOCKED state', () => {
    const workspace = makeWorkspace();
    workspace.hydrateGroup({
      id: 'group-1',
      rules: [{ id: 'rule-1', name: 'is_active', operator: 'is', threshold: true }],
    });
    const group = workspace.groups.value[0];
    expect(group.state.value).toBe(SchedulerState.LOCKED);
    expect(group.rules.value[0].state.value).toBe(SchedulerState.LOCKED);
  });

  it('hydrateGroup throws after destroy', () => {
    const workspace = makeWorkspace();
    workspace.destroy();
    expect(() =>
      workspace.hydrateGroup({
        id: 'group-1',
        rules: [{ id: 'rule-1', name: 'is_active', operator: 'is', threshold: true }],
      })
    ).toThrow(/destroyed/);
  });
});

describe('RuleWorkspaceScheduler - validate & build', () => {
  it('validate returns false when no groups', () => {
    const workspace = makeWorkspace();
    expect(workspace.validate()).toBe(false);
  });

  it('validate returns true when all groups have confirmed rules', () => {
    const workspace = makeWorkspace([SAMPLE_GROUP]);
    expect(workspace.validate()).toBe(true);
  });

  it('build returns readonly AtomicRuleGroup[]', () => {
    const workspace = makeWorkspace([SAMPLE_GROUP]);
    const result = workspace.build();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('group-1');
  });

  it('build throws when incomplete', () => {
    const workspace = makeWorkspace();
    workspace.addGroup();
    expect(() => workspace.build()).toThrow(/incomplete/);
  });
});

describe('RuleWorkspaceScheduler - destroy', () => {
  it('destroy is idempotent', () => {
    const workspace = makeWorkspace();
    workspace.destroy();
    expect(() => workspace.destroy()).not.toThrow();
  });

  it('destroy clears all groups', () => {
    const workspace = makeWorkspace();
    workspace.addGroup();
    workspace.addGroup();
    workspace.destroy();
    expect(workspace.groups.value).toEqual([]);
  });
});

// suppress unused
void vi;
