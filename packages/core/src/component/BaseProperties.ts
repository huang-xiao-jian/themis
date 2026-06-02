import type { FieldConstraints } from '../dsl/FieldConstraints'

/**
 * 抽象表单组件的基础属性
 *
 * 屏蔽具体 UI 框架/组件库差异，所有推断出的表单组件属性都继承此接口
 */
export interface BaseProperties {
  /** 字段标识 */
  readonly name: string
  /** 字段标题 */
  readonly title: string
  /** 数据类型 */
  readonly dataType: 'string' | 'number' | 'boolean'
  /** 语义化场景 */
  readonly semantic?: 'rate' | 'date' | 'time' | 'datetime' | 'duration' | 'percentage'
  /** 数据约束 */
  readonly constraints?: FieldConstraints
}
