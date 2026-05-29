/**
 * 基础数据项
 */
export interface FieldDataSource {
  label: string;
  value: string | number;
}

/**
 * 分页结果
 */
export interface PaginatedResult<T = FieldDataSource> {
  data: T[];
  total: number;
}

/**
 * 基础 Fetcher - 无分页、无过滤
 */
export interface BasicFetcher<T = FieldDataSource> {
  fetch(): Promise<T[]>;
}

/**
 * 分页 Fetcher
 */
export interface PaginationFetcher<T = FieldDataSource> {
  fetch(page: number, pageSize: number): Promise<PaginatedResult<T>>;
}

/**
 * 过滤 Fetcher
 */
export interface FilterFetcher<T = FieldDataSource> {
  fetch(keyword: string): Promise<T[]>;
}

/**
 * 分页+过滤 Fetcher
 */
export interface PaginationFilterFetcher<T = FieldDataSource> {
  fetch(keyword: string, page: number, pageSize: number): Promise<PaginatedResult<T>>;
}

/**
 * Fetcher 类型
 */
export type FetcherType = 'basic' | 'pagination' | 'filter' | 'pagination-filter';
