import type { Signal } from '@preact/signals-core';
import type { Pagination } from '../fetcher/Pagination';

/**
 * 动态资源 - 基础型（无分页、无过滤）
 */
export interface ElementaryDynamicResource<T> {
  readonly name: string;
  readonly loading: Signal<boolean>;
  readonly options: Signal<readonly T[]>;
  onRefresh: () => void;
  onFiltrate: (value: string | number) => void;
}

/**
 * 动态资源 - 分页型
 */
export interface PaginatedDynamicResource<T> {
  readonly name: string;
  readonly loading: Signal<boolean>;
  readonly options: Signal<readonly T[]>;
  readonly pagination: Signal<Pagination>;
  onFlip: (page: number) => void;
  onRefresh: () => void;
}

/**
 * 动态资源 - 过滤型
 */
export interface FilterableDynamicResource<T> {
  readonly name: string;
  readonly loading: Signal<boolean>;
  readonly options: Signal<readonly T[]>;
  onFilter: (keyword: string) => void;
  onRefresh: () => void;
}

/**
 * 动态资源 - 分页+过滤型
 */
export interface PaginatedFilterableDynamicResource<T> {
  readonly name: string;
  readonly loading: Signal<boolean>;
  readonly options: Signal<readonly T[]>;
  readonly pagination: Signal<Pagination>;
  readonly keyword: Signal<string>;
  onFlip: (page: number) => void;
  onFilter: (keyword: string) => void;
  onRefresh: () => void;
}

/**
 * 动态资源联合类型
 */
export type DynamicResource<T> =
  | ElementaryDynamicResource<T>
  | PaginatedDynamicResource<T>
  | FilterableDynamicResource<T>
  | PaginatedFilterableDynamicResource<T>;
