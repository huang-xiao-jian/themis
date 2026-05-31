/**
 * 分页结果结构
 */
export interface PaginatedResult<T = FieldDataSource> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

/**
 * 静态资源 Fetcher - 由内核默认提供，StaticResource 无需业务方注入
 */
export interface StaticFetcher<T = FieldDataSource> {
  fetch(): Promise<T[]>;
}

/**
 * 基础动态资源 Fetcher - 无分页、无过滤
 */
export interface ElementaryFetcher<T = FieldDataSource> {
  fetch(): Promise<T[]>;
}

/**
 * 分页动态资源 Fetcher
 */
export interface PaginatedFetcher<T = FieldDataSource> {
  fetch(page: number, pageSize: number): Promise<PaginatedResult<T>>;
}

/**
 * 过滤动态资源 Fetcher
 */
export interface FilterableFetcher<T = FieldDataSource> {
  fetch(keyword: string): Promise<T[]>;
}

/**
 * 分页+过滤动态资源 Fetcher
 */
export interface PaginatedFilterableFetcher<T = FieldDataSource> {
  fetch(keyword: string, page: number, pageSize: number): Promise<PaginatedResult<T>>;
}

/**
 * Fetcher 类型标识
 */
export type FetcherType =
  | 'static'
  | 'elementary'
  | 'paginated'
  | 'filterable'
  | 'paginatedFilterable';

/**
 * Fetcher Provider - 静态资源
 */
export interface StaticFetcherProvider<T extends FieldDataSource = FieldDataSource>
  extends FetcherProvider<T> {
  readonly fetcher: StaticFetcher<T>;
}

/**
 * Fetcher Provider - 基础动态资源
 */
export interface ElementaryFetcherProvider<T extends FieldDataSource = FieldDataSource>
  extends FetcherProvider<T> {
  readonly fetcher: ElementaryFetcher<T>;
}

/**
 * Fetcher Provider - 分页动态资源
 */
export interface PaginatedFetcherProvider<T extends FieldDataSource = FieldDataSource>
  extends FetcherProvider<T> {
  readonly fetcher: PaginatedFetcher<T>;
}

/**
 * Fetcher Provider - 过滤动态资源
 */
export interface FilterableFetcherProvider<T extends FieldDataSource = FieldDataSource>
  extends FetcherProvider<T> {
  readonly fetcher: FilterableFetcher<T>;
}

/**
 * Fetcher Provider - 分页+过滤动态资源
 */
export interface PaginatedFilterableFetcherProvider<T extends FieldDataSource = FieldDataSource>
  extends FetcherProvider<T> {
  readonly fetcher: PaginatedFilterableFetcher<T>;
}

/**
 * Fetcher Provider 基类
 */
export interface FetcherProvider<T extends FieldDataSource = FieldDataSource> {
  /** 资源名称 */
  readonly resourceName: string;
  /** Fetcher 类型 */
  readonly type: FetcherType;
  /** fetcher 实例 */
  readonly fetcher:
    | StaticFetcher<T>
    | ElementaryFetcher<T>
    | PaginatedFetcher<T>
    | FilterableFetcher<T>
    | PaginatedFilterableFetcher<T>;
}

/**
 * 数据源选项结构
 */
export interface FieldDataSource {
  label: string;
  value: string | number;
  disabled?: boolean;
}