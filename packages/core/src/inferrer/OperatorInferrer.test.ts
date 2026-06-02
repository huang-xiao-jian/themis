import { describe, expect, it } from 'vitest'
import { OperatorInferrer } from './OperatorInferrer'
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

describe('OperatorInferrer', () => {
  const inferrer = new OperatorInferrer()

  it('number + point + single', () => {
    expect(inferrer.infer(numberPointSingleFactor).map((o) => o.value)).toEqual([
      '=',
      '≠',
      '>',
      '>=',
      '<',
      '<=',
    ])
  })

  it('number + point + multiple', () => {
    expect(inferrer.infer(numberPointMultipleFactor).map((o) => o.value)).toEqual(['in', 'not in'])
  })

  it('number + range + single', () => {
    expect(inferrer.infer(numberRangeSingleFactor).map((o) => o.value)).toEqual([
      'between',
      'not between',
    ])
  })

  it('number + range + multiple', () => {
    expect(inferrer.infer(numberRangeMultipleFactor).map((o) => o.value)).toEqual([
      'between any',
      'between all',
      'not between any',
      'not between all',
    ])
  })

  it('string + point + single', () => {
    expect(inferrer.infer(stringPointSingleFactor).map((o) => o.value)).toEqual([
      '=',
      '≠',
      'contains',
      'within',
      'starts_with',
      'ends_with',
    ])
  })

  it('string + point + multiple', () => {
    expect(inferrer.infer(stringPointMultipleFactor).map((o) => o.value)).toEqual(['in', 'not in'])
  })

  it('boolean → is', () => {
    expect(inferrer.infer(booleanFactor).map((o) => o.value)).toEqual(['is'])
  })

  it('semantic=date + range + single follows number table', () => {
    expect(inferrer.infer(dateRangeSingleFactor).map((o) => o.value)).toEqual([
      'between',
      'not between',
    ])
  })

  it('label equals value (no translation)', () => {
    const result = inferrer.infer(booleanFactor)
    expect(result[0].label).toBe(result[0].value)
  })
})
