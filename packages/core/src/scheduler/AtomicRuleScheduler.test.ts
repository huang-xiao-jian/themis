import { signal } from '@preact/signals-core';
import { assert, describe, expect, it, vi } from 'vitest';
import { ALL_FACTORS, BOOLEAN_FACTOR } from '../__fixtures__/factors';
import { SAMPLE_RULE_1 } from '../__fixtures__/rules';
import { SchedulerState } from '../dsl/SchedulerState';
import { TransitionEventType } from '../dsl/TransitionEventType';
import { DefaultDynamicResourceFactory } from '../factory/DynamicResourceFactory';
import { FetcherRegistry } from '../factory/FetcherRegistry';
import { DefaultResourceFactory } from '../factory/ResourceFactory';
import { DefaultStaticResourceFactory } from '../factory/StaticResourceFactory';
import { OperatorInferrer } from '../inferrer/OperatorInferrer';
import { ThresholderInferrer } from '../inferrer/ThresholderInferrer';
import { AtomicRuleScheduler } from './AtomicRuleScheduler';
import { createGroupCoordination, type GroupCoordination } from './Coordination';

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

function makeFactorsSignal() {
  return signal(ALL_FACTORS);
}

function makeCoordination(editingRuleId?: string | null): GroupCoordination {
  const c = createGroupCoordination();
  c.editingRuleId.value = editingRuleId ?? null;
  return c;
}

function makeScheduler(coordination?: GroupCoordination, snapshot?: typeof SAMPLE_RULE_1) {
  return new AtomicRuleScheduler(
    'rule-1',
    coordination ?? makeCoordination(),
    makeFactorsSignal(),
    makeInferrers(),
    snapshot
  );
}

describe('AtomicRuleScheduler - creation', () => {
  it('starts with null factor and null rule when no snapshot', () => {
    const scheduler = makeScheduler();
    expect(scheduler.id).toBe('rule-1');
    expect(scheduler.factor.value).toBeNull();
    expect(scheduler.rule.value).toBeNull();
  });

  it('restores from snapshot and sets rule signal', () => {
    const scheduler = makeScheduler(makeCoordination(), SAMPLE_RULE_1);
    expect(scheduler.rule.value).toEqual(SAMPLE_RULE_1);
    expect(scheduler.factor.value?.name).toBe('employee');
  });
});

describe('AtomicRuleScheduler - state derivation', () => {
  it('state is EDITING when editingRuleId matches this.id', () => {
    const coordination = makeCoordination('rule-1');
    const scheduler = new AtomicRuleScheduler(
      'rule-1',
      coordination,
      makeFactorsSignal(),
      makeInferrers()
    );
    expect(scheduler.state.value).toBe(SchedulerState.EDITING);
    expect(scheduler.editable.value).toBe(true);
  });

  it('state is LOCKED when editingRuleId does not match', () => {
    const coordination = makeCoordination('other-rule');
    const scheduler = makeScheduler(coordination);
    expect(scheduler.state.value).toBe(SchedulerState.LOCKED);
    expect(scheduler.editable.value).toBe(false);
  });

  it('state responds to editingRuleId changes', () => {
    const coordination = makeCoordination();
    const scheduler = new AtomicRuleScheduler(
      'rule-1',
      coordination,
      makeFactorsSignal(),
      makeInferrers()
    );
    expect(scheduler.state.value).toBe(SchedulerState.LOCKED);
    coordination.editingRuleId.value = 'rule-1';
    expect(scheduler.state.value).toBe(SchedulerState.EDITING);
  });

  it('form pattern reflects state', () => {
    const coordination = makeCoordination('rule-1');
    const scheduler = new AtomicRuleScheduler(
      'rule-1',
      coordination,
      makeFactorsSignal(),
      makeInferrers()
    );
    expect(scheduler.form.pattern).toBe('editable');
    coordination.editingRuleId.value = null;
    expect(scheduler.form.pattern).toBe('disabled');
  });
});

describe('AtomicRuleScheduler - form inference', () => {
  it('setting name via form updates operator dataSource in form', () => {
    const coordination = makeCoordination('rule-1');
    const scheduler = makeScheduler(coordination);

    scheduler.form.setValues({ name: 'is_active' });
    expect(scheduler.factor.value?.name).toBe('is_active');
    const $operator = scheduler.form.getFieldState('operator');
    assert($operator.dataSource);
    expect($operator.dataSource.map((o) => o.value)).toEqual(['is']);
  });
});

describe('AtomicRuleScheduler - onOk', () => {
  it('onOk validates, updates rule signal, and emits OK event', () => {
    const coordination = makeCoordination('rule-1');
    const scheduler = makeScheduler(coordination);
    const handler = vi.fn();
    coordination.bus.on(TransitionEventType.OK, handler);

    scheduler.form.setValues({ name: 'is_active' });
    scheduler.form.setFieldState('operator', (s) => {
      s.value = 'is';
    });
    scheduler.form.setFieldState('threshold', (s) => {
      s.value = true;
    });

    scheduler.onOk();

    expect(scheduler.rule.value).toEqual({
      id: 'rule-1',
      name: 'is_active',
      operator: 'is',
      threshold: true,
    });
    expect(handler).toHaveBeenCalledWith({
      type: TransitionEventType.OK,
      sourceId: 'rule-1',
    });
  });

  it('onOk does nothing when form is invalid', () => {
    const coordination = makeCoordination('rule-1');
    const scheduler = makeScheduler(coordination);
    const handler = vi.fn();
    coordination.bus.on(TransitionEventType.OK, handler);

    scheduler.onOk(); // form is empty

    expect(scheduler.rule.value).toBeNull();
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('AtomicRuleScheduler - onEdit', () => {
  it('emits EDIT event', () => {
    const coordination = makeCoordination();
    const scheduler = makeScheduler(coordination);
    const handler = vi.fn();
    coordination.bus.on(TransitionEventType.EDIT, handler);

    scheduler.onEdit();

    expect(handler).toHaveBeenCalledWith({
      type: TransitionEventType.EDIT,
      sourceId: 'rule-1',
    });
  });
});

describe('AtomicRuleScheduler - onCancel', () => {
  it('emits CANCEL event', () => {
    const coordination = makeCoordination('rule-1');
    const scheduler = makeScheduler(coordination);
    const handler = vi.fn();
    coordination.bus.on(TransitionEventType.CANCEL, handler);

    scheduler.onCancel();

    expect(handler).toHaveBeenCalledWith({
      type: TransitionEventType.CANCEL,
      sourceId: 'rule-1',
    });
  });
});

describe('AtomicRuleScheduler - build', () => {
  it('build returns rule.value after onOk', () => {
    const coordination = makeCoordination('rule-1');
    const scheduler = makeScheduler(coordination);

    scheduler.form.setValues({ name: 'is_active' });
    scheduler.form.setFieldState('operator', (s) => {
      s.value = 'is';
    });
    scheduler.form.setFieldState('threshold', (s) => {
      s.value = true;
    });
    scheduler.onOk();

    const rule = scheduler.build();
    expect(rule).toEqual({
      id: 'rule-1',
      name: 'is_active',
      operator: 'is',
      threshold: true,
    });
  });

  it('build throws when no confirmed data', () => {
    const coordination = makeCoordination('rule-1');
    const scheduler = makeScheduler(coordination);
    expect(() => scheduler.build()).toThrow(/no confirmed data/);
  });
});

describe('AtomicRuleScheduler - validate', () => {
  it('validate returns false when form is incomplete', () => {
    const coordination = makeCoordination('rule-1');
    const scheduler = makeScheduler(coordination);
    expect(scheduler.validate()).toBe(false);
  });

  it('validate returns true when all fields are set', () => {
    const coordination = makeCoordination('rule-1');
    const scheduler = makeScheduler(coordination);

    scheduler.form.setValues({ name: 'is_active' });
    scheduler.form.setFieldState('operator', (s) => {
      s.value = 'is';
    });
    scheduler.form.setFieldState('threshold', (s) => {
      s.value = true;
    });
    expect(scheduler.validate()).toBe(true);
  });
});

describe('AtomicRuleScheduler - destroy', () => {
  it('destroy is idempotent', () => {
    const scheduler = makeScheduler();
    scheduler.destroy();
    expect(() => scheduler.destroy()).not.toThrow();
  });

  it('destroy prevents further event emissions', () => {
    const coordination = makeCoordination();
    const scheduler = makeScheduler(coordination);
    const handler = vi.fn();
    coordination.bus.on(TransitionEventType.OK, handler);
    scheduler.destroy();
    scheduler.onOk();
    expect(handler).not.toHaveBeenCalled();
  });
});

// suppress unused
void BOOLEAN_FACTOR;
