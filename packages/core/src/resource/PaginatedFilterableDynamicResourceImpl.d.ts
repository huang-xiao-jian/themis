import { type Signal } from '@preact/signals-core';
import type { PaginatedFilterableFetcher } from '../fetcher/PaginatedFilterableFetcher';
import type { Pagination } from '../fetcher/Pagination';
import type { PaginatedFilterableDynamicResource } from './DynamicResource';
/**
 * 分页+过滤动态资源实现
 *
 * - 翻页不丢 keyword
 * - 过滤后回到第 1 页
 */
export declare class PaginatedFilterableDynamicResourceImpl<
  T,
> implements PaginatedFilterableDynamicResource<T> {
  readonly name: string;
  readonly loading: Signal<boolean>;
  readonly options: Signal<readonly T[]>;
  readonly pagination: Signal<Pagination>;
  readonly keyword: Signal<string>;
  private readonly fetcher;
  private readonly defaultPageSize;
  constructor(name: string, fetcher: PaginatedFilterableFetcher<T>, defaultPageSize?: number);
  onFlip: (page: number) => void;
  onFilter: (keyword: string) => void;
  onRefresh: () => void;
  private fetchCurrent;
}
