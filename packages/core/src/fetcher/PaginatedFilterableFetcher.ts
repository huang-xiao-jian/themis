import type { PaginatedResult } from './PaginatedResult'

/**
 * 分页 + 过滤动态资源 Fetcher
 *
 * Fetcher 只与 Resource features 相关，资源名称在请求时透传
 */
export interface PaginatedFilterableFetcher<T = unknown> {
  /**
   * @param resourceName 资源名称
   * @param keyword 过滤关键词
   * @param page 当前页码（从 1 开始）
   * @param pageSize 每页条数
   */
  fetch(
    resourceName: string,
    keyword: string,
    page: number,
    pageSize: number
  ): Promise<PaginatedResult<T>>
}
