/**
 * 基础动态资源 Fetcher：无分页、无服务端过滤
 *
 * Fetcher 只与 Resource features 相关，不与具体 Resource.name 绑定。
 * 资源名称在请求时通过 fetch(resourceName, ...) 传入
 */
export interface ElementaryFetcher<T = unknown> {
  /**
   * @param resourceName 资源名称，来源于 DSL 中 RuleFactorDefinition.resource.name
   */
  fetch(resourceName: string): Promise<readonly T[]>;
}
