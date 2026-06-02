/**
 * 动态资源支持的特性
 */
export type DynamicRuleFactorResourceFeature = 'pagination' | 'filter';

/**
 * 动态资源描述
 *
 * 选项从服务端下发，根据 features 组合确定具体亚型
 */
export interface DynamicRuleFactorResource {
  /** 资源名称，全局唯一 */
  readonly name: string;
  /** 资源支持的特性（分页、服务端过滤） */
  readonly features?: readonly DynamicRuleFactorResourceFeature[];
}
