import type { ElementaryFetcher } from './ElementaryFetcher';
import { FetcherType } from './FetcherType';
import type { FilterableFetcher } from './FilterableFetcher';
import type { PaginatedFetcher } from './PaginatedFetcher';
import type { PaginatedFilterableFetcher } from './PaginatedFilterableFetcher';

/**
 * Elementary 资源 Provider
 */
export interface ElementaryFetcherProvider<T = unknown> {
  readonly type: FetcherType.ELEMENTARY;
  readonly fetcher: ElementaryFetcher<T>;
}

/**
 * 分页资源 Provider
 */
export interface PaginatedFetcherProvider<T = unknown> {
  readonly type: FetcherType.PAGINATED;
  readonly fetcher: PaginatedFetcher<T>;
}

/**
 * 可过滤资源 Provider
 */
export interface FilterableFetcherProvider<T = unknown> {
  readonly type: FetcherType.FILTERABLE;
  readonly fetcher: FilterableFetcher<T>;
}

/**
 * 分页+过滤资源 Provider
 */
export interface PaginatedFilterableFetcherProvider<T = unknown> {
  readonly type: FetcherType.PAGINATED_FILTERABLE;
  readonly fetcher: PaginatedFilterableFetcher<T>;
}

/**
 * FetcherProvider 联合类型（按 type 判别）
 *
 * 重要：不包含 resourceName 字段。Fetcher 行为与具体资源名称解耦，
 * 资源名称作为请求参数在 fetch() 调用时传入
 */
export type FetcherProvider<T = unknown> =
  | ElementaryFetcherProvider<T>
  | PaginatedFetcherProvider<T>
  | FilterableFetcherProvider<T>
  | PaginatedFilterableFetcherProvider<T>;
