import { describe, expect, it } from 'vitest'
import { resolveOperatorTable } from './operatorMappings'
import {
  booleanFactor,
  dateRangeSingleFactor,
  numberPointMultipleFactor,
  numberPointSingleFactor,
  numberRangeMultipleFactor,
  numberRangeSingleFactor,
  stringPointMultipleFactor,
  stringPointSingleFactor,
} from '../__fixtures__/factors'

describe('resolveOperatorTable', () => {
  it('number + point + single returns comparison ops', () => {
    expect(resolveOperatorTable(numberPointSingleFactor)).toEqual([
      '=',
      '≠',
      '>',
      '>=',
      '<',
      '<=',
    ])
  })

  it('number + point + multiple returns in/not in', () => {
    expect(resolveOperatorTable(numberPointMultipleFactor)).toEqual(['in', 'not in'])
  })

  it('number + range + single returns between/not between', () => {
    expect(resolveOperatorTable(numberRangeSingleFactor)).toEqual(['between', 'not between'])
  })

  it('number + range + multiple returns 4 between variants', () => {
    expect(resolveOperatorTable(numberRangeMultipleFactor)).toEqual([
      'between any',
      'between all',
      'not between any',
      'not between all',
    ])
  })

  it('string + point + single returns string ops', () => {
    expect(resolveOperatorTable(stringPointSingleFactor)).toEqual([
      '=',
      '≠',
      'contains',
      'within',
      'starts_with',
      'ends_with',
    ])
  })

  it('string + point + multiple returns in/not in', () => {
    expect(resolveOperatorTable(stringPointMultipleFactor)).toEqual(['in', 'not in'])
  })

  it('boolean returns is only', () => {
    expect(resolveOperatorTable(booleanFactor)).toEqual(['is'])
  })

  it('semantic=date + range + single follows number table', () => {
    expect(resolveOperatorTable(dateRangeSingleFactor)).toEqual(['between', 'not between'])
  })
})
