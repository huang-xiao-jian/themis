import { signal } from '@preact/signals-core';
import { describe, expect, it } from 'vitest';
import { ALL_FACTORS, BOOLEAN_FACTOR } from '../__fixtures__/factors';
import { SAMPLE_GROUP } from '../__fixtures__/rules';
import { DefaultDynamicResourceFactory } from '../factory/DynamicResourceFactory';
import { FetcherRegistry } from '../factory/FetcherRegistry';
import { DefaultResourceFactory } from '../factory/ResourceFactory';
import { DefaultStaticResourceFactory } from '../factory/StaticResourceFactory';
import { ThresholderInferrer } from '../inferrer/ThresholderInferrer';
import { AtomicRuleGroupScheduler } from './AtomicRuleGroupScheduler';
import { AtomicRuleScheduler } from './AtomicRuleScheduler';

function makeInferrer() {
  const factory = new DefaultResourceFactory(
    new DefaultStaticResourceFactory(),
    new DefaultDynamicResourceFactory(new FetcherRegistry())
  );
  return new ThresholderInferrer(factory);
}

function makeFactorsSignal() {
  return signal<readonly (typeof ALL_FACTORS)[number][]>(ALL_FACTORS);
}

describe('AtomicRuleGroupScheduler - create & lifecycle', () => {
  it('starts with empty rules and full factors', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    expect(group.id).toBe('group-1');
    expect(group.rules.value).toEqual([]);
    expect(group.factors.value).toHaveLength(ALL_FACTORS.length);
    expect(group.snapshots).toEqual([]);
  });

  it('restores rules from snapshot in edit scenario', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler(
      'group-1',
      makeFactorsSignal(),
      inferrer,
      SAMPLE_GROUP
    );
    expect(group.snapshots).toHaveLength(2);
    expect(group.rules.value).toHaveLength(2);
    expect(group.rules.value[0]).toBeInstanceOf(AtomicRuleScheduler);
    expect(group.rules.value[0].id).toBe('rule-1');
  });

  it('factors disables names from current rules', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler(
      'group-1',
      makeFactorsSignal(),
      inferrer,
      SAMPLE_GROUP
    );
    // SAMPLE_GROUP 的两个 rule 分别用了 employee 和 deliver_city
    expect(group.factors.value).toHaveLength(ALL_FACTORS.length);
    expect(group.factors.value.find((o) => o.value === 'employee')?.disabled).toBe(true);
    expect(group.factors.value.find((o) => o.value === 'deliver_city')?.disabled).toBe(true);
  });
});

describe('AtomicRuleGroupScheduler - addRule/removeRule', () => {
  it('addRule appends a new rule scheduler with auto-generated id', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    const rule = group.addRule();
    expect(group.rules.value).toHaveLength(1);
    expect(rule).toBeInstanceOf(AtomicRuleScheduler);
    expect(rule.id).toBeDefined();
    expect(group.rules.value[0]).toBe(rule);
  });

  it('removeRule removes the scheduler and destroys it', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    const rule = group.addRule();
    group.removeRule(rule.id);
    expect(group.rules.value).toEqual([]);
    // destroy 幂等
    expect(() => rule.destroy()).not.toThrow();
  });

  it('removeRule on non-existent id is a no-op', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    group.addRule();
    expect(() => group.removeRule('rule-999')).not.toThrow();
    expect(group.rules.value).toHaveLength(1);
  });

  it('factors updates reactively when rule name changes', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    const rule = group.addRule();
    // 设置 rule.name 后 factors 应该 disable 该因子
    rule.onFieldChange({ field: 'name', value: 'is_active' });
    expect(group.factors.value.find((o) => o.value === 'is_active')?.disabled).toBe(true);
  });

  it('factors restores when rule is removed', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    const rule = group.addRule();
    rule.onFieldChange({ field: 'name', value: 'is_active' });
    expect(group.factors.value.find((o) => o.value === 'is_active')?.disabled).toBe(true);
    group.removeRule(rule.id);
    expect(group.factors.value.find((o) => o.value === 'is_active')?.disabled).toBeFalsy();
  });
});

describe('AtomicRuleGroupScheduler - pickRule', () => {
  it('pickRule returns the rule scheduler with matching id', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    const rule = group.addRule();
    expect(group.pickRule(rule.id)).toBe(rule);
  });

  it('pickRule returns undefined for non-existent id', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    expect(group.pickRule('non-existent')).toBeUndefined();
  });
});

describe('AtomicRuleGroupScheduler - validate & build', () => {
  it('validate returns false when no rules', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    expect(group.validate()).toBe(false);
  });

  it('validate returns false when any rule is incomplete', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    const rule = group.addRule();
    rule.onFieldChange({ field: 'name', value: 'is_active' });
    rule.onFieldChange({ field: 'operator', value: 'is' });
    // threshold 未设置
    expect(group.validate()).toBe(false);
  });

  it('validate returns true when all rules are complete', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    const rule = group.addRule();
    rule.onFieldChange({ field: 'name', value: 'is_active' });
    rule.onFieldChange({ field: 'operator', value: 'is' });
    rule.onFieldChange({ field: 'threshold', value: true });
    expect(group.validate()).toBe(true);
  });

  it('build throws when incomplete', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    expect(() => group.build()).toThrow(/incomplete/);
  });

  it('build returns AtomicRuleGroup with id when complete', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    const rule = group.addRule();
    rule.onFieldChange({ field: 'name', value: 'is_active' });
    rule.onFieldChange({ field: 'operator', value: 'is' });
    rule.onFieldChange({ field: 'threshold', value: true });
    const result = group.build();
    expect(result.id).toBe('group-1');
    expect(result.rules).toHaveLength(1);
    expect(result.rules[0].name).toBe('is_active');
    expect(result.rules[0].operator).toBe('is');
    expect(result.rules[0].threshold).toBe(true);
  });
});

describe('AtomicRuleGroupScheduler - canAddRule', () => {
  it('canAddRule is true when no rules exist', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    expect(group.canAddRule.value).toBe(true);
  });

  it('canAddRule remains true while rules < factors', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    group.addRule();
    // ALL_FACTORS.length = 10, rules.length = 1 → still true
    expect(group.canAddRule.value).toBe(true);
  });

  it('canAddRule becomes false when rules reach factors count', () => {
    const inferrer = makeInferrer();
    const factorsSignal = makeFactorsSignal();
    const group = new AtomicRuleGroupScheduler('group-1', factorsSignal, inferrer);
    // 添加与 ALL_FACTORS 相同数量的 rule
    for (let i = 0; i < ALL_FACTORS.length; i++) {
      group.addRule();
    }
    expect(group.canAddRule.value).toBe(false);
  });

  it('canAddRule restores to true after removing a rule', () => {
    const inferrer = makeInferrer();
    const factorsSignal = makeFactorsSignal();
    const group = new AtomicRuleGroupScheduler('group-1', factorsSignal, inferrer);
    const rules: AtomicRuleScheduler[] = [];
    for (let i = 0; i < ALL_FACTORS.length; i++) {
      rules.push(group.addRule());
    }
    expect(group.canAddRule.value).toBe(false);
    group.removeRule(rules[0].id);
    expect(group.canAddRule.value).toBe(true);
  });
});

describe('AtomicRuleGroupScheduler - destroy', () => {
  it('destroy releases all child rules', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    const r1 = group.addRule();
    const r2 = group.addRule();
    group.destroy();
    expect(group.rules.value).toEqual([]);
    expect(() => r1.destroy()).not.toThrow();
    expect(() => r2.destroy()).not.toThrow();
  });

  it('destroy is idempotent', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    group.destroy();
    expect(() => group.destroy()).not.toThrow();
  });

  it('addRule throws after destroy', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    group.destroy();
    expect(() => group.addRule()).toThrow(/destroyed/);
  });
});

describe('AtomicRuleGroupScheduler - hydrateRule', () => {
  it('hydrateRule restores rule from AtomicRule data', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    group.hydrateRule({ id: 'rule-1', name: 'is_active', operator: 'is', threshold: true });
    expect(group.rules.value).toHaveLength(1);
    expect(group.rules.value[0]).toBeInstanceOf(AtomicRuleScheduler);
    expect(group.rules.value[0].id).toBe('rule-1');
  });

  it('hydrateRule preserves original id, name, operator, threshold', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    group.hydrateRule({ id: 'rule-1', name: 'is_active', operator: 'is', threshold: true });
    const rule = group.rules.value[0];
    expect(rule.name.value).toBe('is_active');
    expect(rule.operator.value).toBe('is');
    expect(rule.threshold.value).toBe(true);
    expect(group.validate()).toBe(true);
  });

  it('hydrateRule throws after destroy', () => {
    const inferrer = makeInferrer();
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer);
    group.destroy();
    expect(() =>
      group.hydrateRule({ id: 'rule-1', name: 'is_active', operator: 'is', threshold: true })
    ).toThrow(/destroyed/);
  });
});

// suppress unused
void BOOLEAN_FACTOR;
