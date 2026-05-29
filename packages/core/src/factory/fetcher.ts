import type {
  BasicFetcher,
  FetcherType,
  FieldDataSource,
  FilterFetcher,
  PaginationFetcher,
  PaginationFilterFetcher,
} from '../contracts/fetcher';

/**
 * Fetcher 注册项
 */
export interface FetcherRegistration<T extends FieldDataSource = FieldDataSource> {
  readonly type: FetcherType;
  readonly fetcher:
    | BasicFetcher<T>
    | PaginationFetcher<T>
    | FilterFetcher<T>
    | PaginationFilterFetcher<T>;
}

/**
 * 基础 Fetcher 提供器
 */
export function provideBasicFetcher<T extends FieldDataSource>(
  fetcher: BasicFetcher<T>
): FetcherRegistration<T> & { readonly type: 'basic' } {
  return {
    type: 'basic',
    fetcher,
  } as FetcherRegistration<T> & { readonly type: 'basic' };
}

/**
 * 分页 Fetcher 提供器
 */
export function providePaginationFetcher<T extends FieldDataSource>(
  fetcher: PaginationFetcher<T>
): FetcherRegistration<T> & { readonly type: 'pagination' } {
  return {
    type: 'pagination',
    fetcher,
  } as FetcherRegistration<T> & { readonly type: 'pagination' };
}

/**
 * 过滤 Fetcher 提供器
 */
export function provideFilterFetcher<T extends FieldDataSource>(
  fetcher: FilterFetcher<T>
): FetcherRegistration<T> & { readonly type: 'filter' } {
  return {
    type: 'filter',
    fetcher,
  } as FetcherRegistration<T> & { readonly type: 'filter' };
}

/**
 * 分页+过滤 Fetcher 提供器
 */
export function providePaginationFilterFetcher<T extends FieldDataSource>(
  fetcher: PaginationFilterFetcher<T>
): FetcherRegistration<T> & { readonly type: 'pagination-filter' } {
  return {
    type: 'pagination-filter',
    fetcher,
  } as FetcherRegistration<T> & { readonly type: 'pagination-filter' };
}
