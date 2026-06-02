/**
 * 基础动态资源 Fetcher：无分页、无服务端过滤
 */
export interface ElementaryFetcher<T = unknown> {
  fetch(): Promise<readonly T[]>
}
