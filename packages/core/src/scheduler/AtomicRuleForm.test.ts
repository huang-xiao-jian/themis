import { assert, describe, expect, it } from 'vitest';
import { ALL_FACTORS } from '../__fixtures__/factors';
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

    // Must create fields to activate reactions
    form.createField({ name: 'name' });
    form.createField({ name: 'operator' });
    form.createField({ name: 'threshold' });

    form.setValues({ name: 'is_active' });

    const $operator = form.getFieldState('operator');
    assert($operator.dataSource);
    expect($operator.dataSource).toEqual([{ label: 'is', value: 'is' }]);
  });

  it('changing name resets operator and threshold values', () => {
    const form = createAtomicRuleForm({
      factors: ALL_FACTORS,
      inferrers: makeInferrers(),
    });

    // Must create fields to activate reactions
    form.createField({ name: 'name' });
    form.createField({ name: 'operator' });
    form.createField({ name: 'threshold' });

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

    expect(form.values.operator).toBeUndefined();
    expect(form.values.threshold).toBeUndefined();
  });

  it('threshold componentProps is updated from inference', () => {
    const form = createAtomicRuleForm({
      factors: ALL_FACTORS,
      inferrers: makeInferrers(),
    });

    // Must create fields to activate reactions
    form.createField({ name: 'name' });
    form.createField({ name: 'operator' });
    form.createField({ name: 'threshold' });

    form.setValues({ name: 'is_active' });

    const $threshold = form.getFieldState('threshold');

    // 断言：$threshold.component 为数组类型
    assert(Array.isArray($threshold.component));

    // 断言：$threshold.component[1] 为实际组件属性
    expect($threshold.component[1]).toMatchObject({
      properties: {
        type: 'Switch',
      },
    });
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

    // Must create fields to active reactions
    form.createField({ name: 'name' });
    form.createField({ name: 'operator' });
    form.createField({ name: 'threshold' });

    // Inference should have been triggered (operator dataSource populated)
    const $operator = form.getFieldState('operator');

    assert($operator);
    assert($operator.dataSource);

    expect($operator.dataSource.length).toBeGreaterThan(0);
  });
});
