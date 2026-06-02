import type { FilterableFetcher } from './FilterableFetcher'
import type { FilterableFetcherProvider } from './FetcherProvider'

/**
 * 创建 Filterable Fetcher Provider
 */
export function provideFilterableFetcher<T>(
  resourceName: string,
  fetcher: FilterableFetcher<T>
): FilterableFetcherProvider<T> {
  return {
    type: 'filterable',
    resourceName,
    fetcher,
  }
}
