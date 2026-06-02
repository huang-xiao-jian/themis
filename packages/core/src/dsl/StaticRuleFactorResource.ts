import type { FieldDataSource } from './FieldDataSource'

/**
 * 静态资源描述
 *
 * 选项固定，编译期或配置期即可确定全部可选项
 */
export interface StaticRuleFactorResource {
  /** 资源名称，全局唯一 */
  readonly name: string;
  /** 预设的可选项列表 */
  readonly options: readonly FieldDataSource[]
}
