import { describe, expect, it } from 'vitest';
import { ALL_FACTORS } from '../__fixtures__/factors';
import { FactorOptionsInferrer } from './FactorOptionsInferrer';

describe('FactorOptionsInferrer', () => {
  const inferrer = new FactorOptionsInferrer();

  it('returns all factors when used list is empty', () => {
    const result = inferrer.infer(ALL_FACTORS, []);
    expect(result).toHaveLength(ALL_FACTORS.length);
    expect(result[0]).toEqual({ label: ALL_FACTORS[0].title, value: ALL_FACTORS[0].name });
  });

  it('marks factors as disabled when name is in used list', () => {
    const used = ['is_active', 'employee'] as const;
    const result = inferrer.infer(ALL_FACTORS, used);
    expect(result).toHaveLength(ALL_FACTORS.length);
    expect(result.find((o) => o.value === 'is_active')).toEqual({
      label: '是否激活',
      value: 'is_active',
      disabled: true,
    });
    expect(result.find((o) => o.value === 'employee')).toEqual({
      label: '员工',
      value: 'employee',
      disabled: true,
    });
  });

  it('all factors disabled when all are used', () => {
    const used = ALL_FACTORS.map((f) => f.name);
    const result = inferrer.infer(ALL_FACTORS, used);
    expect(result).toHaveLength(ALL_FACTORS.length);
    expect(result.every((o) => o.disabled === true)).toBe(true);
  });

  it('preserves input order', () => {
    const result = inferrer.infer(ALL_FACTORS, ['is_active']);
    const names = result.map((o) => o.value);
    const expectedNames = ALL_FACTORS.map((f) => f.name);
    expect(names).toEqual(expectedNames);
  });

  it('label comes from title', () => {
    const result = inferrer.infer(ALL_FACTORS, []);
    const employee = result.find((o) => o.value === 'employee');
    expect(employee?.label).toBe('员工');
  });
});
