import { describe, expect, it } from 'vitest'
import { DataType } from '../dsl/DataType'
import { Mode } from '../dsl/Mode'
import { Quantity } from '../dsl/Quantity'
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
    expect(_check.dataType).toBe(DataType.BOOLEAN)
  })

  it('stringPointSingleFactor is assignable to RuleFactorDefinition', () => {
    const _check: RuleFactorDefinition = stringPointSingleFactor
    expect(_check.dataType).toBe(DataType.STRING)
    expect(_check.mode).toBe(Mode.POINT)
    expect(_check.quantity).toBe(Quantity.SINGLE)
  })

  it('stringPointMultipleFactor is assignable to RuleFactorDefinition', () => {
    const _check: RuleFactorDefinition = stringPointMultipleFactor
    expect(_check.quantity).toBe(Quantity.MULTIPLE)
  })

  it('numberPointSingleFactor is assignable to RuleFactorDefinition', () => {
    const _check: RuleFactorDefinition = numberPointSingleFactor
    expect(_check.dataType).toBe(DataType.NUMBER)
  })

  it('numberRangeSingleFactor is assignable to RuleFactorDefinition', () => {
    const _check: RuleFactorDefinition = numberRangeSingleFactor
    expect(_check.mode).toBe(Mode.RANGE)
    expect(_check.quantity).toBe(Quantity.SINGLE)
  })

  it('numberRangeMultipleFactor is assignable to RuleFactorDefinition', () => {
    const _check: RuleFactorDefinition = numberRangeMultipleFactor
    expect(_check.mode).toBe(Mode.RANGE)
    expect(_check.quantity).toBe(Quantity.MULTIPLE)
  })
})
