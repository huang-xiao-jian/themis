import { type Signal } from '@preact/signals-core';
import type { PaginatedFetcher } from '../fetcher/PaginatedFetcher';
import type { Pagination } from '../fetcher/Pagination';
import type { PaginatedDynamicResource } from './DynamicResource';
/**
 * 分页动态资源实现
 */
export declare class PaginatedDynamicResourceImpl<T> implements PaginatedDynamicResource<T> {
  readonly name: string;
  readonly loading: Signal<boolean>;
  readonly options: Signal<readonly T[]>;
  readonly pagination: Signal<Pagination>;
  private readonly fetcher;
  private readonly defaultPageSize;
  constructor(name: string, fetcher: PaginatedFetcher<T>, defaultPageSize?: number);
  onFlip: (page: number) => void;
  onRefresh: () => void;
  private fetchCurrent;
}
