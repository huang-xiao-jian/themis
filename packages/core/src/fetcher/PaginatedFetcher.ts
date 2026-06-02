import type { PaginatedResult } from './PaginatedResult';

/**
 * 分页动态资源 Fetcher：支持分页
 *
 * Fetcher 只与 Resource features 相关，资源名称在请求时透传
 */
export interface PaginatedFetcher<T = unknown> {
  /**
   * @param resourceName 资源名称
   * @param page 当前页码（从 1 开始）
   * @param pageSize 每页条数
   */
  fetch(resourceName: string, page: number, pageSize: number): Promise<PaginatedResult<T>>;
}
