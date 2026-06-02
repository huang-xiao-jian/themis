import type { ElementaryFetcher } from './ElementaryFetcher'
import type { ElementaryFetcherProvider } from './FetcherProvider'

/**
 * 创建 Elementary Fetcher Provider
 *
 * @param resourceName 资源名称
 * @param fetcher 基础 Fetcher 实现
 */
export function provideElementaryFetcher<T>(
  resourceName: string,
  fetcher: ElementaryFetcher<T>
): ElementaryFetcherProvider<T> {
  return {
    type: 'elementary',
    resourceName,
    fetcher,
  }
}
