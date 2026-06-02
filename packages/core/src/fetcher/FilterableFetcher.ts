/**
 * 过滤动态资源 Fetcher：支持服务端过滤（关键词）
 */
export interface FilterableFetcher<T = unknown> {
  fetch(keyword: string): Promise<readonly T[]>
}
