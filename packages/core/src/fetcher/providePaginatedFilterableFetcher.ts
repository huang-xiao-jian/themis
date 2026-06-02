import type { PaginatedFilterableFetcher } from './PaginatedFilterableFetcher'
import type { PaginatedFilterableFetcherProvider } from './FetcherProvider'

/**
 * 创建 PaginatedFilterable Fetcher Provider
 *
 * Fetcher 只与 Resource features 相关，不需传入 resourceName
 */
export function providePaginatedFilterableFetcher<T>(
  fetcher: PaginatedFilterableFetcher<T>
): PaginatedFilterableFetcherProvider<T> {
  return {
    type: 'paginatedFilterable',
    fetcher,
  }
}
