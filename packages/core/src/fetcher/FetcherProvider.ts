import type { ElementaryFetcher } from './ElementaryFetcher'
import type { PaginatedFetcher } from './PaginatedFetcher'
import type { FilterableFetcher } from './FilterableFetcher'
import type { PaginatedFilterableFetcher } from './PaginatedFilterableFetcher'

/**
 * Elementary 资源 Provider
 */
export interface ElementaryFetcherProvider<T = unknown> {
  readonly type: 'elementary'
  readonly resourceName: string
  readonly fetcher: ElementaryFetcher<T>
}

/**
 * 分页资源 Provider
 */
export interface PaginatedFetcherProvider<T = unknown> {
  readonly type: 'paginated'
  readonly resourceName: string
  readonly fetcher: PaginatedFetcher<T>
}

/**
 * 可过滤资源 Provider
 */
export interface FilterableFetcherProvider<T = unknown> {
  readonly type: 'filterable'
  readonly resourceName: string
  readonly fetcher: FilterableFetcher<T>
}

/**
 * 分页+过滤资源 Provider
 */
export interface PaginatedFilterableFetcherProvider<T = unknown> {
  readonly type: 'paginatedFilterable'
  readonly resourceName: string
  readonly fetcher: PaginatedFilterableFetcher<T>
}

/**
 * FetcherProvider 联合类型
 */
export type FetcherProvider<T = unknown> =
  | ElementaryFetcherProvider<T>
  | PaginatedFetcherProvider<T>
  | FilterableFetcherProvider<T>
  | PaginatedFilterableFetcherProvider<T>
