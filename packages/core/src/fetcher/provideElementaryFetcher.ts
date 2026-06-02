import type { ElementaryFetcher } from './ElementaryFetcher';
import type { ElementaryFetcherProvider } from './FetcherProvider';
import { FetcherType } from './FetcherType';

/**
 * 创建 Elementary Fetcher Provider
 *
 * Fetcher 只与 Resource features 相关，不需传入 resourceName
 *
 * @param fetcher 基础 Fetcher 实现
 */
export function provideElementaryFetcher<T>(
  fetcher: ElementaryFetcher<T>
): ElementaryFetcherProvider<T> {
  return {
    type: FetcherType.ELEMENTARY,
    fetcher,
  };
}
