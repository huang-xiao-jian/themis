import type { PaginatedFilterableFetcherProvider } from './FetcherProvider';
import { FetcherType } from './FetcherType';
import type { PaginatedFilterableFetcher } from './PaginatedFilterableFetcher';

/**
 * 创建 PaginatedFilterable Fetcher Provider
 *
 * Fetcher 只与 Resource features 相关，不需传入 resourceName
 */
export function providePaginatedFilterableFetcher<T>(
  fetcher: PaginatedFilterableFetcher<T>
): PaginatedFilterableFetcherProvider<T> {
  return {
    type: FetcherType.PAGINATED_FILTERABLE,
    fetcher,
  };
}
