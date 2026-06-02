/**
 * Fetcher 类型枚举
 *
 * 标识 FetcherProvider 的能力组合（是否支持分页、是否支持服务端过滤），
 * 与 DynamicRuleFactorResource.features 共同决定 DynamicResource 亚型
 */
export enum FetcherType {
  /** 基础动态资源 - 不支持分页、不支持服务端过滤 */
  ELEMENTARY = 'elementary',
  /** 分页动态资源 - 支持分页、不支持服务端过滤 */
  PAGINATED = 'paginated',
  /** 可过滤动态资源 - 不支持分页、支持服务端过滤 */
  FILTERABLE = 'filterable',
  /** 分页+过滤动态资源 - 支持分页、支持服务端过滤 */
  PAGINATED_FILTERABLE = 'paginatedFilterable',
}
