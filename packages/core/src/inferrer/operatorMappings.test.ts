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
import { resolveOperatorTable } from './operatorMappings';

describe('resolveOperatorTable', () => {
  it('number + point + single returns comparison ops', () => {
    expect(resolveOperatorTable(NUMBER_POINT_SINGLE_FACTOR)).toEqual([
      '=',
      '≠',
      '>',
      '>=',
      '<',
      '<=',
    ]);
  });

  it('number + point + multiple returns in/not in', () => {
    expect(resolveOperatorTable(NUMBER_POINT_MULTIPLE_FACTOR)).toEqual(['in', 'not in']);
  });

  it('number + range + single returns between/not between', () => {
    expect(resolveOperatorTable(NUMBER_RANGE_SINGLE_FACTOR)).toEqual(['between', 'not between']);
  });

  it('number + range + multiple returns 4 between variants', () => {
    expect(resolveOperatorTable(NUMBER_RANGE_MULTIPLE_FACTOR)).toEqual([
      'between any',
      'between all',
      'not between any',
      'not between all',
    ]);
  });

  it('string + point + single returns string ops', () => {
    expect(resolveOperatorTable(STRING_POINT_SINGLE_FACTOR)).toEqual([
      '=',
      '≠',
      'contains',
      'within',
      'starts_with',
      'ends_with',
    ]);
  });

  it('string + point + multiple returns in/not in', () => {
    expect(resolveOperatorTable(STRING_POINT_MULTIPLE_FACTOR)).toEqual(['in', 'not in']);
  });

  it('boolean returns is only', () => {
    expect(resolveOperatorTable(BOOLEAN_FACTOR)).toEqual(['is']);
  });

  it('semantic=date + range + single follows number table', () => {
    expect(resolveOperatorTable(DATE_RANGE_SINGLE_FACTOR)).toEqual(['between', 'not between']);
  });
});
