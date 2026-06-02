import { describe, expect, it } from 'vitest'
import {
  booleanFactor,
  numberPointSingleFactor,
  numberRangeMultipleFactor,
  numberRangeSingleFactor,
  stringPointMultipleFactor,
  stringPointSingleFactor,
} from './factors'
import type { RuleFactorDefinition } from '../dsl'

describe('factors fixtures', () => {
  it('booleanFactor is assignable to RuleFactorDefinition', () => {
    const _check: RuleFactorDefinition = booleanFactor
    expect(_check.dataType).toBe('boolean')
  })

  it('stringPointSingleFactor is assignable to RuleFactorDefinition', () => {
    const _check: RuleFactorDefinition = stringPointSingleFactor
    expect(_check.dataType).toBe('string')
    expect(_check.mode).toBe('point')
    expect(_check.quantity).toBe('single')
  })

  it('stringPointMultipleFactor is assignable to RuleFactorDefinition', () => {
    const _check: RuleFactorDefinition = stringPointMultipleFactor
    expect(_check.quantity).toBe('multiple')
  })

  it('numberPointSingleFactor is assignable to RuleFactorDefinition', () => {
    const _check: RuleFactorDefinition = numberPointSingleFactor
    expect(_check.dataType).toBe('number')
  })

  it('numberRangeSingleFactor is assignable to RuleFactorDefinition', () => {
    const _check: RuleFactorDefinition = numberRangeSingleFactor
    expect(_check.mode).toBe('range')
    expect(_check.quantity).toBe('single')
  })

  it('numberRangeMultipleFactor is assignable to RuleFactorDefinition', () => {
    const _check: RuleFactorDefinition = numberRangeMultipleFactor
    expect(_check.mode).toBe('range')
    expect(_check.quantity).toBe('multiple')
  })
})
