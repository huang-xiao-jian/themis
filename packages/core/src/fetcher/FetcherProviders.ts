import type {
  FetcherProvider,
  StaticFetcherProvider,
  ElementaryFetcherProvider,
  PaginatedFetcherProvider,
  FilterableFetcherProvider,
  PaginatedFilterableFetcherProvider,
  StaticFetcher,
  ElementaryFetcher,
  PaginatedFetcher,
  FilterableFetcher,
  PaginatedFilterableFetcher,
  FieldDataSource,
} from '../types/Fetcher';

/**
 * 创建静态资源 Fetcher Provider
 * - 静态资源由内核默认提供，业务方无需注入
 * - 这里用于创建带数据的 StaticResource
 */
function provideStaticFetcher<T extends FieldDataSource>(
  resourceName: string,
  options: T[]
): StaticFetcherProvider<T> {
  const fetcher: StaticFetcher<T> = {
    fetch: async () => options,
  };
  return {
    resourceName,
    type: 'static',
    fetcher,
  };
}

/**
 * 创建基础动态资源 Fetcher Provider
 */
function provideElementaryFetcher<T extends FieldDataSource>(
  resourceName: string,
  fetcher: ElementaryFetcher<T>
): ElementaryFetcherProvider<T> {
  return {
    resourceName,
    type: 'elementary',
    fetcher,
  };
}

/**
 * 创建分页动态资源 Fetcher Provider
 */
function providePaginatedFetcher<T extends FieldDataSource>(
  resourceName: string,
  fetcher: PaginatedFetcher<T>
): PaginatedFetcherProvider<T> {
  return {
    resourceName,
    type: 'paginated',
    fetcher,
  };
}

/**
 * 创建过滤动态资源 Fetcher Provider
 */
function provideFilterableFetcher<T extends FieldDataSource>(
  resourceName: string,
  fetcher: FilterableFetcher<T>
): FilterableFetcherProvider<T> {
  return {
    resourceName,
    type: 'filterable',
    fetcher,
  };
}

/**
 * 创建分页+过滤动态资源 Fetcher Provider
 */
function providePaginatedFilterableFetcher<T extends FieldDataSource>(
  resourceName: string,
  fetcher: PaginatedFilterableFetcher<T>
): PaginatedFilterableFetcherProvider<T> {
  return {
    resourceName,
    type: 'paginatedFilterable',
    fetcher,
  };
}

export {
  provideStaticFetcher,
  provideElementaryFetcher,
  providePaginatedFetcher,
  provideFilterableFetcher,
  providePaginatedFilterableFetcher,
};