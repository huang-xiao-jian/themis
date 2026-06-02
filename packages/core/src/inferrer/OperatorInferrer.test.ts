import { describe, expect, it } from 'vitest';
import {
  BOOLEAN_FACTOR,
  DATE_RANGE_SINGLE_FACTOR,
  NUMBER_POINT_MULTIPLE_FACTOR,
  NUMBER_POINT_SINGLE_FACTOR,
  NUMBER_RANGE_MULTIPLE_FACTOR,
  NUMBER_RANGE_SINGLE_FACTOR,
  STRING_POINT_MULTIPLE_FACTOR,
  STRING_POINT_SINGLE_FACTOR,
} from '../__fixtures__/factors';
import { OperatorInferrer } from './OperatorInferrer';

describe('OperatorInferrer', () => {
  const inferrer = new OperatorInferrer();

  it('number + point + single', () => {
    expect(inferrer.infer(NUMBER_POINT_SINGLE_FACTOR).map((o) => o.value)).toEqual([
      '=',
      '≠',
      '>',
      '>=',
      '<',
      '<=',
    ]);
  });

  it('number + point + multiple', () => {
    expect(inferrer.infer(NUMBER_POINT_MULTIPLE_FACTOR).map((o) => o.value)).toEqual([
      'in',
      'not in',
    ]);
  });

  it('number + range + single', () => {
    expect(inferrer.infer(NUMBER_RANGE_SINGLE_FACTOR).map((o) => o.value)).toEqual([
      'between',
      'not between',
    ]);
  });

  it('number + range + multiple', () => {
    expect(inferrer.infer(NUMBER_RANGE_MULTIPLE_FACTOR).map((o) => o.value)).toEqual([
      'between any',
      'between all',
      'not between any',
      'not between all',
    ]);
  });

  it('string + point + single', () => {
    expect(inferrer.infer(STRING_POINT_SINGLE_FACTOR).map((o) => o.value)).toEqual([
      '=',
      '≠',
      'contains',
      'within',
      'starts_with',
      'ends_with',
    ]);
  });

  it('string + point + multiple', () => {
    expect(inferrer.infer(STRING_POINT_MULTIPLE_FACTOR).map((o) => o.value)).toEqual([
      'in',
      'not in',
    ]);
  });

  it('boolean → is', () => {
    expect(inferrer.infer(BOOLEAN_FACTOR).map((o) => o.value)).toEqual(['is']);
  });

  it('semantic=date + range + single follows number table', () => {
    expect(inferrer.infer(DATE_RANGE_SINGLE_FACTOR).map((o) => o.value)).toEqual([
      'between',
      'not between',
    ]);
  });

  it('label equals value (no translation)', () => {
    const result = inferrer.infer(BOOLEAN_FACTOR);
    expect(result[0].label).toBe(result[0].value);
  });
});
