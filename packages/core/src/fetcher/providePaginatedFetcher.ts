import type { PaginatedFetcherProvider } from './FetcherProvider';
import { FetcherType } from './FetcherType';
import type { PaginatedFetcher } from './PaginatedFetcher';

/**
 * 创建 Paginated Fetcher Provider
 *
 * Fetcher 只与 Resource features 相关，不需传入 resourceName
 */
export function providePaginatedFetcher<T>(
  fetcher: PaginatedFetcher<T>
): PaginatedFetcherProvider<T> {
  return {
    type: FetcherType.PAGINATED,
    fetcher,
  };
}
