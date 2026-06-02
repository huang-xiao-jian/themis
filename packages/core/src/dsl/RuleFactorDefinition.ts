import { DataType } from './DataType'
import { Mode } from './Mode'
import { Quantity } from './Quantity'
import { Semantic } from './Semantic'
import type { DynamicRuleFactorResource } from './DynamicRuleFactorResource'
import type { FieldConstraints } from './FieldConstraints'
import { StaticRuleFactorResource } from './StaticRuleFactorResource'

/**
 * 规则因子定义（DSL 主入口）
 *
 * 描述一个规则因子的语义化结构，供解释器推断 operator / thresholder
 */
export interface RuleFactorDefinition {
  /** 规则因子唯一名称 */
  readonly name: string
  /** 显示标题 */
  readonly title: string
  /** 描述信息（可选） */
  readonly description?: string
  /** 原始数据类型 */
  readonly dataType: DataType
  /** 语义化场景 */
  readonly semantic?: Semantic
  /** 模式：单点 / 区间，默认 POINT */
  readonly mode?: Mode
  /** 数量：单值 / 多值，默认 SINGLE */
  readonly quantity?: Quantity
  /** 关联资源（受限选项）。包含 options 字段时为静态，否则为动态 */
  readonly resource?: DynamicRuleFactorResource | StaticRuleFactorResource
  /** 数据约束 */
  readonly constraints?: FieldConstraints
}
