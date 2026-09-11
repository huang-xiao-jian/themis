import type { PaginatedFilterableFetcherProvider } from './FetcherProvider';
import type { PaginatedFilterableFetcher } from './PaginatedFilterableFetcher';
/**
 * 创建 PaginatedFilterable Fetcher Provider
 *
 * Fetcher 只与 Resource features 相关，不需传入 resourceName
 */
export declare function providePaginatedFilterableFetcher<T>(
  fetcher: PaginatedFilterableFetcher<T>
): PaginatedFilterableFetcherProvider<T>;
