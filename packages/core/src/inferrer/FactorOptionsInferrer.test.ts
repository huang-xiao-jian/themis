import { describe, expect, it } from 'vitest';
import { ALL_FACTORS } from '../__fixtures__/factors';
import { FactorOptionsInferrer } from './FactorOptionsInferrer';

describe('FactorOptionsInferrer', () => {
  const inferrer = new FactorOptionsInferrer();

  it('returns all factors when used set is empty', () => {
    const result = inferrer.infer(ALL_FACTORS, new Set());
    expect(result).toHaveLength(ALL_FACTORS.length);
    expect(result[0]).toEqual({ label: ALL_FACTORS[0].title, value: ALL_FACTORS[0].name });
  });

  it('excludes factors whose name is in used set', () => {
    const used = new Set(['is_active', 'employee']);
    const result = inferrer.infer(ALL_FACTORS, used);
    expect(result.find((o) => o.value === 'is_active')).toBeUndefined();
    expect(result.find((o) => o.value === 'employee')).toBeUndefined();
    expect(result.length).toBe(ALL_FACTORS.length - 2);
  });

  it('returns empty when all factors are used', () => {
    const used = new Set(ALL_FACTORS.map((f) => f.name));
    expect(inferrer.infer(ALL_FACTORS, used)).toEqual([]);
  });

  it('preserves input order', () => {
    const used = new Set(['is_active']);
    const result = inferrer.infer(ALL_FACTORS, used);
    const names = result.map((o) => o.value);
    const expectedNames = ALL_FACTORS.filter((f) => f.name !== 'is_active').map((f) => f.name);
    expect(names).toEqual(expectedNames);
  });

  it('label comes from title', () => {
    const result = inferrer.infer(ALL_FACTORS, new Set());
    const employee = result.find((o) => o.value === 'employee');
    expect(employee?.label).toBe('员工');
  });
});
