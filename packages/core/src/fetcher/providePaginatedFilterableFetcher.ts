import type { PaginatedFilterableFetcher } from './PaginatedFilterableFetcher'
import type { PaginatedFilterableFetcherProvider } from './FetcherProvider'

/**
 * 创建 PaginatedFilterable Fetcher Provider
 */
export function providePaginatedFilterableFetcher<T>(
  resourceName: string,
  fetcher: PaginatedFilterableFetcher<T>
): PaginatedFilterableFetcherProvider<T> {
  return {
    type: 'paginatedFilterable',
    resourceName,
    fetcher,
  }
}
