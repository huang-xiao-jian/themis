import { describe, expect, it } from 'vitest';
import type { AtomicRule, AtomicRuleGroup } from '../dsl';
import { SAMPLE_GROUP, SAMPLE_RULE_1, SAMPLE_RULE_2 } from './rules';

describe('rules fixtures', () => {
  it('SAMPLE_RULE_1 is assignable to AtomicRule', () => {
    const _check: AtomicRule = SAMPLE_RULE_1;
    expect(_check.id).toBe('rule-1');
    expect(_check.name).toBe('employee');
    expect(_check.operator).toBe('eq');
    expect(_check.threshold).toBe(100);
  });

  it('SAMPLE_RULE_2 carries array threshold', () => {
    const _check: AtomicRule = SAMPLE_RULE_2;
    expect(Array.isArray(_check.threshold)).toBe(true);
  });

  it('SAMPLE_GROUP is assignable to AtomicRuleGroup', () => {
    const _check: AtomicRuleGroup = SAMPLE_GROUP;
    expect(_check.rules).toHaveLength(2);
  });
});
