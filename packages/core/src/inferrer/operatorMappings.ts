import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition'

/**
 * 数据类型
 */
type DataType = 'string' | 'number' | 'boolean'

/**
 * 模式
 */
type Mode = 'point' | 'range'

/**
 * 数量
 */
type Quantity = 'single' | 'multiple'

/**
 * number / 语义化场景 的 Operator 表
 */
const NUMBER_POINT_SINGLE: readonly string[] = ['=', '≠', '>', '>=', '<', '<=']

const NUMBER_POINT_MULTIPLE: readonly string[] = ['in', 'not in']

const NUMBER_RANGE_SINGLE: readonly string[] = ['between', 'not between']

const NUMBER_RANGE_MULTIPLE: readonly string[] = [
  'between any',
  'between all',
  'not between any',
  'not between all',
]

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
]

const STRING_POINT_MULTIPLE: readonly string[] = ['in', 'not in']

/**
 * boolean 的 Operator 表
 */
const BOOLEAN_POINT_SINGLE: readonly string[] = ['is']

/**
 * 解析后的数据域：含语义化场景时走 number 表，否则按 dataType
 */
function resolveDataDomain(factor: RuleFactorDefinition): DataType {
  if (factor.semantic) {
    return 'number'
  }
  return factor.dataType
}

/**
 * 解析模式（默认 point）
 */
function resolveMode(factor: RuleFactorDefinition): Mode {
  return factor.mode ?? 'point'
}

/**
 * 解析数量（默认 single）
 */
function resolveQuantity(factor: RuleFactorDefinition): Quantity {
  return factor.quantity ?? 'single'
}

/**
 * 解析 Operator 列表
 *
 * 根据 dataType + semantic + mode + quantity 锁定具体表
 */
export function resolveOperatorTable(factor: RuleFactorDefinition): readonly string[] {
  const dataDomain = resolveDataDomain(factor)
  const mode = resolveMode(factor)
  const quantity = resolveQuantity(factor)

  // boolean 永远走 is，不受 mode/quantity 影响
  if (dataDomain === 'boolean') {
    return BOOLEAN_POINT_SINGLE
  }

  if (dataDomain === 'number') {
    if (mode === 'point' && quantity === 'single') return NUMBER_POINT_SINGLE
    if (mode === 'point' && quantity === 'multiple') return NUMBER_POINT_MULTIPLE
    if (mode === 'range' && quantity === 'single') return NUMBER_RANGE_SINGLE
    if (mode === 'range' && quantity === 'multiple') return NUMBER_RANGE_MULTIPLE
  }

  if (dataDomain === 'string') {
    // string 仅支持 point 模式
    if (mode === 'point' && quantity === 'single') return STRING_POINT_SINGLE
    if (mode === 'point' && quantity === 'multiple') return STRING_POINT_MULTIPLE
  }

  // 其他组合没有合法 Operator 列表，返回空
  return []
}
