/**
 * 过滤动态资源 Fetcher：支持服务端过滤（关键词）
 *
 * Fetcher 只与 Resource features 相关，资源名称在请求时透传
 */
export interface FilterableFetcher<T = unknown> {
  /**
   * @param resourceName 资源名称
   * @param keyword 过滤关键词
   */
  fetch(resourceName: string, keyword: string): Promise<readonly T[]>
}
