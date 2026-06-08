import { describe, expect, it } from 'vitest';
import { ALL_FACTORS, BOOLEAN_FACTOR } from '../__fixtures__/factors';
import { DefaultDynamicResourceFactory } from '../factory/DynamicResourceFactory';
import { FetcherRegistry } from '../factory/FetcherRegistry';
import { DefaultResourceFactory } from '../factory/ResourceFactory';
import { DefaultStaticResourceFactory } from '../factory/StaticResourceFactory';
import { OperatorInferrer } from '../inferrer/OperatorInferrer';
import { ThresholderInferrer } from '../inferrer/ThresholderInferrer';
import { createAtomicRuleForm } from './AtomicRuleForm';

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

describe('AtomicRuleForm - creation', () => {
  it('creates form with name, operator, threshold fields', () => {
    const form = createAtomicRuleForm({
      factors: ALL_FACTORS,
      inferrers: makeInferrers(),
      initialValues: { name: 'is_active', operator: 'is', threshold: true },
    });

    expect(form.values.name).toBeDefined();
    expect(form.values.operator).toBeDefined();
    expect(form.values.threshold).toBeDefined();
  });

  it('default pattern is editable', () => {
    const form = createAtomicRuleForm({
      factors: ALL_FACTORS,
      inferrers: makeInferrers(),
    });

    expect(form.pattern).toBe('editable');
  });
});

describe('AtomicRuleForm - inference linkage', () => {
  it('changing name updates operator field dataSource internally', () => {
    const form = createAtomicRuleForm({
      factors: ALL_FACTORS,
      inferrers: makeInferrers(),
    });

    form.setValues({ name: 'is_active' });

    const operatorField = form.fields['operator'] as { dataSource: unknown[] };
    expect(operatorField.dataSource).toEqual([{ label: 'is', value: 'is' }]);
  });

  it('changing name resets operator and threshold values', () => {
    const form = createAtomicRuleForm({
      factors: ALL_FACTORS,
      inferrers: makeInferrers(),
    });

    // Set initial values
    form.setValues({ name: 'is_active' });
    form.setFieldState('operator', (s) => {
      s.value = 'is';
    });
    form.setFieldState('threshold', (s) => {
      s.value = true;
    });

    // Switch to another factor → operator/threshold should reset
    form.setValues({ name: 'age' });

    expect(form.values.operator).toBeNull();
    expect(form.values.threshold).toBeUndefined();
  });

  it('threshold componentProps is updated from inference', () => {
    const form = createAtomicRuleForm({
      factors: ALL_FACTORS,
      inferrers: makeInferrers(),
    });

    form.setValues({ name: 'is_active' });

    const thresholdField = form.fields['threshold'] as { componentProps: Record<string, unknown> };
    expect(thresholdField.componentProps).toBeDefined();
    expect((thresholdField.componentProps as { type: string }).type).toBe('Switch');
  });
});

describe('AtomicRuleForm - snapshot restoration', () => {
  it('restores initial values without resetting operator/threshold', () => {
    const form = createAtomicRuleForm({
      factors: ALL_FACTORS,
      inferrers: makeInferrers(),
      initialValues: { name: 'is_active', operator: 'is', threshold: true },
    });

    expect(form.values.name).toBe('is_active');
    expect(form.values.operator).toBe('is');
    expect(form.values.threshold).toBe(true);
    // Inference should have been triggered (operator dataSource populated)
    const operatorField = form.fields['operator'] as { dataSource: unknown[] };
    expect(operatorField.dataSource.length).toBeGreaterThan(0);
  });
});

describe('AtomicRuleForm - pattern switching', () => {
  it('setting pattern to disabled makes fields read-only', () => {
    const form = createAtomicRuleForm({
      factors: ALL_FACTORS,
      inferrers: makeInferrers(),
    });

    form.pattern = 'disabled';
    expect(form.pattern).toBe('disabled');

    const nameField = form.fields['name'] as { pattern: string };
    expect(nameField.pattern).toBe('disabled');
  });
});

// suppress unused
void BOOLEAN_FACTOR;
