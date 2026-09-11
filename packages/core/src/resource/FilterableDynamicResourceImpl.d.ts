import { type Signal } from '@preact/signals-core';
import type { FilterableFetcher } from '../fetcher/FilterableFetcher';
import type { FilterableDynamicResource } from './DynamicResource';
/**
 * 过滤型动态资源实现
 */
export declare class FilterableDynamicResourceImpl<T> implements FilterableDynamicResource<T> {
  readonly name: string;
  readonly loading: Signal<boolean>;
  readonly options: Signal<readonly T[]>;
  private readonly fetcher;
  private currentKeyword;
  constructor(name: string, fetcher: FilterableFetcher<T>);
  onFilter: (keyword: string) => void;
  onRefresh: () => void;
  private fetchCurrent;
}
