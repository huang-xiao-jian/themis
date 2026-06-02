import { describe, expect, it } from 'vitest';
import { allFactors } from '../__fixtures__/factors';
import { sampleGroup } from '../__fixtures__/rules';
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
    const workspace = new RuleWorkspaceScheduler(allFactors, inferrer);
    expect(workspace.snapshots).toEqual([]);
    expect(workspace.groups.value).toEqual([]);
  });

  it('restores groups from snapshots in edit scenario', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(allFactors, inferrer, [sampleGroup]);
    expect(workspace.snapshots).toHaveLength(1);
    expect(workspace.groups.value).toHaveLength(1);
    expect(workspace.groups.value[0]).toBeInstanceOf(AtomicRuleGroupScheduler);
  });
});

describe('RuleWorkspaceScheduler - addGroup/removeGroup', () => {
  it('addGroup creates a new group scheduler', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(allFactors, inferrer);
    const group = workspace.addGroup('g-1');
    expect(workspace.groups.value).toHaveLength(1);
    expect(group.id).toBe('g-1');
  });

  it('removeGroup destroys and removes the group', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(allFactors, inferrer);
    workspace.addGroup('g-1');
    workspace.removeGroup('g-1');
    expect(workspace.groups.value).toEqual([]);
  });

  it('removeGroup on non-existent id is a no-op', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(allFactors, inferrer);
    expect(() => workspace.removeGroup('nope')).not.toThrow();
  });

  it('addGroup throws after destroy', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(allFactors, inferrer);
    workspace.destroy();
    expect(() => workspace.addGroup('g-1')).toThrow(/destroyed/);
  });
});

describe('RuleWorkspaceScheduler - validate & build', () => {
  it('validate returns false when no groups', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(allFactors, inferrer);
    expect(workspace.validate()).toBe(false);
  });

  it('validate returns false when any group is invalid', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(allFactors, inferrer);
    const group = workspace.addGroup('g-1');
    const rule = group.addRule('rule-1');
    rule.onFieldChange({ field: 'name', value: 'is_active' });
    // 缺 operator / threshold
    expect(workspace.validate()).toBe(false);
  });

  it('validate returns true when everything is complete', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(allFactors, inferrer);
    const group = workspace.addGroup('g-1');
    const rule = group.addRule('rule-1');
    rule.onFieldChange({ field: 'name', value: 'is_active' });
    rule.onFieldChange({ field: 'operator', value: 'is' });
    rule.onFieldChange({ field: 'threshold', value: true });
    expect(workspace.validate()).toBe(true);
  });

  it('build returns readonly AtomicRuleGroup[]', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(allFactors, inferrer);
    const group = workspace.addGroup('g-1');
    const rule = group.addRule('rule-1');
    rule.onFieldChange({ field: 'name', value: 'is_active' });
    rule.onFieldChange({ field: 'operator', value: 'is' });
    rule.onFieldChange({ field: 'threshold', value: true });
    const result = workspace.build();
    expect(result).toHaveLength(1);
    expect(result[0].rules).toEqual([
      { id: 'rule-1', name: 'is_active', operator: 'is', threshold: true },
    ]);
  });

  it('build throws when incomplete', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(allFactors, inferrer);
    workspace.addGroup('g-1');
    expect(() => workspace.build()).toThrow(/incomplete/);
  });
});

describe('RuleWorkspaceScheduler - destroy', () => {
  it('destroy is idempotent', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(allFactors, inferrer);
    workspace.destroy();
    expect(() => workspace.destroy()).not.toThrow();
  });

  it('destroy clears all groups', () => {
    const inferrer = makeInferrer();
    const workspace = new RuleWorkspaceScheduler(allFactors, inferrer);
    workspace.addGroup('g-1');
    workspace.addGroup('g-2');
    workspace.destroy();
    expect(workspace.groups.value).toEqual([]);
  });
});
