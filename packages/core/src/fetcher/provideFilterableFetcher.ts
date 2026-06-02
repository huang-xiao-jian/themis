import type { FilterableFetcherProvider } from './FetcherProvider';
import { FetcherType } from './FetcherType';
import type { FilterableFetcher } from './FilterableFetcher';

/**
 * 创建 Filterable Fetcher Provider
 *
 * Fetcher 只与 Resource features 相关，不需传入 resourceName
 */
export function provideFilterableFetcher<T>(
  fetcher: FilterableFetcher<T>
): FilterableFetcherProvider<T> {
  return {
    type: FetcherType.FILTERABLE,
    fetcher,
  };
}
