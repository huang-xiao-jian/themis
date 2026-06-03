import { describe, expect, it } from 'vitest';
import { ALL_FACTORS } from '../__fixtures__/factors';
import { SAMPLE_GROUP } from '../__fixtures__/rules';
import { DefaultDynamicResourceFactory } from '../factory/DynamicResourceFactory';
import { FetcherRegistry } from '../factory/FetcherRegistry';
import { DefaultResourceFactory } from '../factory/ResourceFactory';
import { DefaultStaticResourceFactory } from '../factory/StaticResourceFactory';
import { ThresholderInferrer } from '../inferrer/ThresholderInferrer';
import { AtomicRuleGroupScheduler } from './AtomicRuleGroupScheduler';
import { RuleWorkspaceScheduler } from './RuleWorkspaceScheduler';

function makeInferrer() {
  const factory = new DefaultResourceFactory(
    new DefaultStaticResourceFactory(),
    new DefaultDynamicResourceFactory(new FetcherRegistry())
  );
  return new ThresholderInferrer(factory);
}

describe('RuleWorkspaceScheduler - creation', () => {
  it('starts with empty groups when no snapshots', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer);
    expect(workspace.snapshots).toEqual([]);
    expect(workspace.groups.value).toEqual([]);
  });

  it('restores groups from snapshots in edit scenario', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer, [SAMPLE_GROUP]);
    expect(workspace.snapshots).toHaveLength(1);
    expect(workspace.groups.value).toHaveLength(1);
    expect(workspace.groups.value[0]).toBeInstanceOf(AtomicRuleGroupScheduler);
  });
});

describe('RuleWorkspaceScheduler - addGroup/removeGroup', () => {
  it('addGroup creates a new group scheduler with auto-generated id', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer);
    const group = workspace.addGroup();
    expect(workspace.groups.value).toHaveLength(1);
    expect(group.id).toBeDefined();
  });

  it('removeGroup destroys and removes the group', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer);
    const group = workspace.addGroup();
    workspace.removeGroup(group.id);
    expect(workspace.groups.value).toEqual([]);
  });

  it('removeGroup on non-existent id is a no-op', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer);
    expect(() => workspace.removeGroup('nope')).not.toThrow();
  });

  it('addGroup throws after destroy', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer);
    workspace.destroy();
    expect(() => workspace.addGroup()).toThrow(/destroyed/);
  });
});

describe('RuleWorkspaceScheduler - pickGroup', () => {
  it('pickGroup returns the group scheduler with matching id', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer);
    const group = workspace.addGroup();
    expect(workspace.pickGroup(group.id)).toBe(group);
  });

  it('pickGroup returns undefined for non-existent id', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer);
    expect(workspace.pickGroup('non-existent')).toBeUndefined();
  });
});

describe('RuleWorkspaceScheduler - validate & build', () => {
  it('validate returns false when no groups', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer);
    expect(workspace.validate()).toBe(false);
  });

  it('validate returns false when any group is invalid', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer);
    const group = workspace.addGroup();
    const rule = group.addRule();
    rule.onFieldChange({ field: 'name', value: 'is_active' });
    // 缺 operator / threshold
    expect(workspace.validate()).toBe(false);
  });

  it('validate returns true when everything is complete', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer);
    const group = workspace.addGroup();
    const rule = group.addRule();
    rule.onFieldChange({ field: 'name', value: 'is_active' });
    rule.onFieldChange({ field: 'operator', value: 'is' });
    rule.onFieldChange({ field: 'threshold', value: true });
    expect(workspace.validate()).toBe(true);
  });

  it('build returns readonly AtomicRuleGroup[] with id', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer);
    const group = workspace.addGroup();
    const rule = group.addRule();
    rule.onFieldChange({ field: 'name', value: 'is_active' });
    rule.onFieldChange({ field: 'operator', value: 'is' });
    rule.onFieldChange({ field: 'threshold', value: true });
    const result = workspace.build();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(group.id);
    expect(result[0].rules).toHaveLength(1);
    expect(result[0].rules[0].name).toBe('is_active');
    expect(result[0].rules[0].operator).toBe('is');
    expect(result[0].rules[0].threshold).toBe(true);
  });

  it('build throws when incomplete', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer);
    workspace.addGroup();
    expect(() => workspace.build()).toThrow(/incomplete/);
  });
});

describe('RuleWorkspaceScheduler - destroy', () => {
  it('destroy is idempotent', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer);
    workspace.destroy();
    expect(() => workspace.destroy()).not.toThrow();
  });

  it('destroy clears all groups', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer);
    workspace.addGroup();
    workspace.addGroup();
    workspace.destroy();
    expect(workspace.groups.value).toEqual([]);
  });
});

describe('RuleWorkspaceScheduler - hydrateGroup', () => {
  it('hydrateGroup restores group from AtomicRuleGroup data', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer);
    workspace.hydrateGroup({
      id: 'group-1',
      rules: [{ id: 'rule-1', name: 'is_active', operator: 'is', threshold: true }],
    });
    expect(workspace.groups.value).toHaveLength(1);
    expect(workspace.groups.value[0].id).toBe('group-1');
    expect(workspace.groups.value[0].rules.value).toHaveLength(1);
    expect(workspace.groups.value[0].rules.value[0].id).toBe('rule-1');
  });

  it('hydrateGroup preserves original group id and nested rules', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer);
    workspace.hydrateGroup({
      id: 'group-1',
      rules: [
        { id: 'rule-1', name: 'is_active', operator: 'is', threshold: true },
        { id: 'rule-2', name: 'deliver_city', operator: 'eq', threshold: 'sh' },
      ],
    });
    const group = workspace.groups.value[0];
    expect(group.id).toBe('group-1');
    expect(group.rules.value[0].name.value).toBe('is_active');
    expect(group.rules.value[1].name.value).toBe('deliver_city');
    expect(workspace.validate()).toBe(true);
  });

  it('hydrateGroup throws after destroy', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(ALL_FACTORS, inferrer);
    workspace.destroy();
    expect(() =>
      workspace.hydrateGroup({
        id: 'group-1',
        rules: [{ id: 'rule-1', name: 'is_active', operator: 'is', threshold: true }],
      })
    ).toThrow(/destroyed/);
  });
});
