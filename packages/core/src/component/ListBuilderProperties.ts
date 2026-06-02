import type { FieldConstraints } from '../dsl/FieldConstraints'

/**
 * 列表项级别属性
 *
 * 描述列表构建器中单项的形态
 */
export interface ListBuilderItemProperties {
  /** 列表项组件类型 */
  readonly type: 'Input' | 'Picker'
  /** 列表项数据类型 */
  readonly dataType: 'string' | 'number' | 'boolean'
  /** 列表项语义化场景 */
  readonly semantic?: 'rate' | 'date' | 'time' | 'datetime' | 'duration' | 'percentage'
  /** 列表项数据约束 */
  readonly constraints?: FieldConstraints
}

/**
 * 列表级别属性
 */
export interface ListBuilderBaseProperties {
  /** 字段标识 */
  readonly name: string
  /** 字段标题 */
  readonly title: string
  /** 列表项数量约束 */
  readonly constraints?: {
    readonly minItems?: number
    readonly maxItems?: number
  }
}

/**
 * 列表构建器
 *
 * 适用场景：string/number + manual + point + quantity=multiple
 */
export interface ListBuilderProperties extends ListBuilderBaseProperties {
  readonly type: 'ListBuilder'
  /** 列表项属性 */
  readonly item: ListBuilderItemProperties
}
