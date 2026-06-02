import type { PaginatedFetcher } from './PaginatedFetcher'
import type { PaginatedFetcherProvider } from './FetcherProvider'

/**
 * 创建 Paginated Fetcher Provider
 */
export function providePaginatedFetcher<T>(
  resourceName: string,
  fetcher: PaginatedFetcher<T>
): PaginatedFetcherProvider<T> {
  return {
    type: 'paginated',
    resourceName,
    fetcher,
  }
}
