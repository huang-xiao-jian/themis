import type { PaginatedResult } from './PaginatedResult'

/**
 * 分页 + 过滤动态资源 Fetcher
 */
export interface PaginatedFilterableFetcher<T = unknown> {
  fetch(keyword: string, page: number, pageSize: number): Promise<PaginatedResult<T>>
}
