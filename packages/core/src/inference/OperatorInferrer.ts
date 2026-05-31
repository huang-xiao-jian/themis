import type { RuleFactorDefinition } from '../types/DSL';
import type { FieldDataSource } from '../types/Fetcher';

/**
 * Operator 定义
 */
interface OperatorDefinition {
  value: string;
  label: string;
}

/**
 * Operator 映射表键名
 */
type OperatorMapKey =
  | 'number-point-single'
  | 'number-point-multiple'
  | 'number-range-single'
  | 'number-range-multiple'
  | 'string-point-single'
  | 'string-point-multiple'
  | 'boolean-point-single';

/**
 * Operator 映射表
 */
const OPERATOR_MAP: Record<OperatorMapKey, readonly OperatorDefinition[]> = {
  'number-point-single': [
    { value: '=', label: '=' },
    { value: '!=', label: '≠' },
    { value: '>', label: '>' },
    { value: '>=', label: '>=' },
    { value: '<', label: '<' },
    { value: '<=', label: '<=' },
  ],
  'number-point-multiple': [
    { value: 'in', label: 'in' },
    { value: 'not_in', label: 'not in' },
  ],
  'number-range-single': [
    { value: 'between', label: 'between' },
    { value: 'not_between', label: 'not between' },
  ],
  'number-range-multiple': [
    { value: 'between_any', label: 'between any' },
    { value: 'between_all', label: 'between all' },
    { value: 'not_between_any', label: 'not between any' },
    { value: 'not_between_all', label: 'not between all' },
  ],
  'string-point-single': [
    { value: '=', label: '=' },
    { value: '!=', label: '≠' },
    { value: 'contains', label: 'contains' },
    { value: 'within', label: 'within' },
    { value: 'starts_with', label: 'starts_with' },
    { value: 'ends_with', label: 'ends_with' },
  ],
  'string-point-multiple': [
    { value: 'in', label: 'in' },
    { value: 'not_in', label: 'not in' },
  ],
  'boolean-point-single': [{ value: 'is', label: 'is' }],
};

/**
 * 根据 dataType + semantic + mode + quantity 推断可用的操作符列表
 *
 * @param factor 规则因子定义
 * @returns 可用的操作符选项列表
 */
export function inferOperators(factor: RuleFactorDefinition): FieldDataSource[] {
  const { dataType, semantic, mode = 'point', quantity = 'single' } = factor;

  // semantic 本质上遵循 dataType=number 的 operator 推断逻辑
  const effectiveDataType = semantic ? 'number' : dataType;

  const key = `${effectiveDataType}-${mode}-${quantity}` as OperatorMapKey;
  const operators = OPERATOR_MAP[key];

  if (!operators) {
    return [];
  }

  return operators.map((op) => ({
    label: op.label,
    value: op.value,
  }));
}