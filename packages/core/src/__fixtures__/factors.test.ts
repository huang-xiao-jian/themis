import { describe, expect, it } from 'vitest';
import type { RuleFactorDefinition } from '../dsl';
import { DataType } from '../dsl/DataType';
import { Mode } from '../dsl/Mode';
import { Quantity } from '../dsl/Quantity';
import {
  BOOLEAN_FACTOR,
  NUMBER_POINT_SINGLE_FACTOR,
  NUMBER_RANGE_MULTIPLE_FACTOR,
  NUMBER_RANGE_SINGLE_FACTOR,
  STRING_POINT_MULTIPLE_FACTOR,
  STRING_POINT_SINGLE_FACTOR,
} from './factors';

describe('factors fixtures', () => {
  it('BOOLEAN_FACTOR is assignable to RuleFactorDefinition', () => {
    const _check: RuleFactorDefinition = BOOLEAN_FACTOR;
    expect(_check.dataType).toBe(DataType.BOOLEAN);
  });

  it('STRING_POINT_SINGLE_FACTOR is assignable to RuleFactorDefinition', () => {
    const _check: RuleFactorDefinition = STRING_POINT_SINGLE_FACTOR;
    expect(_check.dataType).toBe(DataType.STRING);
    expect(_check.mode).toBe(Mode.POINT);
    expect(_check.quantity).toBe(Quantity.SINGLE);
  });

  it('STRING_POINT_MULTIPLE_FACTOR is assignable to RuleFactorDefinition', () => {
    const _check: RuleFactorDefinition = STRING_POINT_MULTIPLE_FACTOR;
    expect(_check.quantity).toBe(Quantity.MULTIPLE);
  });

  it('NUMBER_POINT_SINGLE_FACTOR is assignable to RuleFactorDefinition', () => {
    const _check: RuleFactorDefinition = NUMBER_POINT_SINGLE_FACTOR;
    expect(_check.dataType).toBe(DataType.NUMBER);
  });

  it('NUMBER_RANGE_SINGLE_FACTOR is assignable to RuleFactorDefinition', () => {
    const _check: RuleFactorDefinition = NUMBER_RANGE_SINGLE_FACTOR;
    expect(_check.mode).toBe(Mode.RANGE);
    expect(_check.quantity).toBe(Quantity.SINGLE);
  });

  it('NUMBER_RANGE_MULTIPLE_FACTOR is assignable to RuleFactorDefinition', () => {
    const _check: RuleFactorDefinition = NUMBER_RANGE_MULTIPLE_FACTOR;
    expect(_check.mode).toBe(Mode.RANGE);
    expect(_check.quantity).toBe(Quantity.MULTIPLE);
  });
});
