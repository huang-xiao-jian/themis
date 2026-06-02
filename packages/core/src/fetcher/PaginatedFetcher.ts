import type { PaginatedResult } from './PaginatedResult'

/**
 * 分页动态资源 Fetcher：支持分页
 */
export interface PaginatedFetcher<T = unknown> {
  fetch(page: number, pageSize: number): Promise<PaginatedResult<T>>
}
