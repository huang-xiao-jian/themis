import { signal } from 'alien-signals';
import type { FieldDataSource } from '../contracts/fetcher';

/**
 * Signal 类型别名（基于 alien-signals）
 */
export type Signal<T> = ReturnType<typeof signal<T>>;

/**
 * 分页状态
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * 基础响应式资源
 */
export interface BaseResponseResource {
  readonly name: string;
  readonly loading: Signal<boolean>;
  readonly options: Signal<readonly FieldDataSource[]>;
}

/**
 * 基础动态响应式资源
 */
export interface ElementaryResponseResource extends BaseResponseResource {
  onRefresh(): void;
}

/**
 * 分页响应式资源
 */
export interface PaginationResponseResource extends BaseResponseResource {
  readonly pagination: Signal<Pagination>;
  onFlip(page: number): void;
}

/**
 * 过滤响应式资源
 */
export interface FilterResponseResource extends BaseResponseResource {
  readonly keyword: Signal<string>;
  onFilter(keyword: string): void;
}

/**
 * 分页+过滤响应式资源
 */
export interface PaginationFilterResponseResource extends BaseResponseResource {
  readonly pagination: Signal<Pagination>;
  readonly keyword: Signal<string>;
  onFlip(page: number): void;
  onFilter(keyword: string): void;
}

/**
 * 响应式资源类型联合
 */
export type ResponseResource =
  | ElementaryResponseResource
  | PaginationResponseResource
  | FilterResponseResource
  | PaginationFilterResponseResource;
