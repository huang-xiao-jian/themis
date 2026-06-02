import { DataType } from '../dsl/DataType';
import { Mode } from '../dsl/Mode';
import { Quantity } from '../dsl/Quantity';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';

/**
 * number 的 Operator 表
 */
const NUMBER_POINT_SINGLE: readonly string[] = ['=', '≠', '>', '>=', '<', '<='];

const NUMBER_POINT_MULTIPLE: readonly string[] = ['in', 'not in'];

const NUMBER_RANGE_SINGLE: readonly string[] = ['between', 'not between'];

const NUMBER_RANGE_MULTIPLE: readonly string[] = [
  'between any',
  'between all',
  'not between any',
  'not between all',
];

/**
 * string 的 Operator 表
 */
const STRING_POINT_SINGLE: readonly string[] = [
  '=',
  '≠',
  'contains',
  'within',
  'starts_with',
  'ends_with',
];

const STRING_POINT_MULTIPLE: readonly string[] = ['in', 'not in'];

/**
 * boolean 的 Operator 表
 */
const BOOLEAN_POINT_SINGLE: readonly string[] = ['is'];

/**
 * 解析模式（默认 POINT）
 */
function resolveMode(factor: RuleFactorDefinition): Mode {
  return factor.mode ?? Mode.POINT;
}

/**
 * 解析数量（默认 SINGLE）
 */
function resolveQuantity(factor: RuleFactorDefinition): Quantity {
  return factor.quantity ?? Quantity.SINGLE;
}

/**
 * 解析 Operator 列表
 *
 * 仅根据 dataType + mode + quantity 锁定具体表；semantic 作为 dataType 的精细化扩充，当前阶段不参与推断
 */
export function resolveOperatorTable(factor: RuleFactorDefinition): readonly string[] {
  const dataDomain = factor.dataType;
  const mode = resolveMode(factor);
  const quantity = resolveQuantity(factor);

  // boolean 永远走 is，不受 mode/quantity 影响
  if (dataDomain === DataType.BOOLEAN) {
    return BOOLEAN_POINT_SINGLE;
  }

  if (dataDomain === DataType.NUMBER) {
    if (mode === Mode.POINT && quantity === Quantity.SINGLE) return NUMBER_POINT_SINGLE;
    if (mode === Mode.POINT && quantity === Quantity.MULTIPLE) return NUMBER_POINT_MULTIPLE;
    if (mode === Mode.RANGE && quantity === Quantity.SINGLE) return NUMBER_RANGE_SINGLE;
    if (mode === Mode.RANGE && quantity === Quantity.MULTIPLE) return NUMBER_RANGE_MULTIPLE;
  }

  if (dataDomain === DataType.STRING) {
    // string 仅支持 point 模式
    if (mode === Mode.POINT && quantity === Quantity.SINGLE) return STRING_POINT_SINGLE;
    if (mode === Mode.POINT && quantity === Quantity.MULTIPLE) return STRING_POINT_MULTIPLE;
  }

  // 其他组合没有合法 Operator 列表，返回空
  return [];
}
