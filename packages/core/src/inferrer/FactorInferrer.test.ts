import { describe, expect, it } from 'vitest';
import { ALL_FACTORS, BOOLEAN_FACTOR, NUMBER_POINT_SINGLE_FACTOR } from '../__fixtures__/factors';
import { FactorInferrer } from './FactorInferrer';

describe('FactorInferrer', () => {
  const inferrer = new FactorInferrer(ALL_FACTORS);

  it('returns the matching factor by name', () => {
    const result = inferrer.infer('is_active');
    expect(result).toBe(BOOLEAN_FACTOR);
  });

  it('returns undefined when name does not exist', () => {
    const result = inferrer.infer('nonexistent');
    expect(result).toBeUndefined();
  });

  it('returns correct factor among multiple', () => {
    const result = inferrer.infer('age');
    expect(result).toBe(NUMBER_POINT_SINGLE_FACTOR);
  });

  it('returns undefined for empty string', () => {
    const result = inferrer.infer('');
    expect(result).toBeUndefined();
  });

  it('returns undefined when infer is called with null', () => {
    expect(inferrer.infer(null as unknown as string)).toBeUndefined();
  });

  it('returns undefined when infer is called with undefined', () => {
    expect(inferrer.infer(undefined as unknown as string)).toBeUndefined();
  });

  it('returns undefined when constructed with empty array', () => {
    const inferrer = new FactorInferrer([]);
    expect(inferrer.infer('is_active')).toBeUndefined();
  });
});
