import type { FilterableFetcherProvider } from './FetcherProvider';
import type { FilterableFetcher } from './FilterableFetcher';
/**
 * 创建 Filterable Fetcher Provider
 *
 * Fetcher 只与 Resource features 相关，不需传入 resourceName
 */
export declare function provideFilterableFetcher<T>(
  fetcher: FilterableFetcher<T>
): FilterableFetcherProvider<T>;
