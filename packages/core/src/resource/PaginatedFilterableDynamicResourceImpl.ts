import { signal, type Signal } from '@preact/signals-core';
import type { PaginatedFilterableFetcher } from '../fetcher/PaginatedFilterableFetcher';
import type { Pagination } from '../fetcher/Pagination';
import type { PaginatedFilterableDynamicResource } from './DynamicResource';

/**
 * 分页+过滤动态资源实现
 *
 * - 翻页不丢 keyword
 * - 过滤后回到第 1 页
 */
export class PaginatedFilterableDynamicResourceImpl<
  T,
> implements PaginatedFilterableDynamicResource<T> {
  readonly name: string;
  readonly loading: Signal<boolean>;
  readonly options: Signal<readonly T[]>;
  readonly pagination: Signal<Pagination>;
  readonly keyword: Signal<string>;
  private readonly fetcher: PaginatedFilterableFetcher<T>;
  private readonly defaultPageSize: number;

  constructor(name: string, fetcher: PaginatedFilterableFetcher<T>, defaultPageSize = 20) {
    this.name = name;
    this.fetcher = fetcher;
    this.defaultPageSize = defaultPageSize;
    this.loading = signal(false);
    this.options = signal<readonly T[]>([]);
    this.pagination = signal<Pagination>({ page: 1, pageSize: defaultPageSize, total: 0 });
    this.keyword = signal('');
  }

  onFlip = (page: number): void => {
    this.pagination.value = { ...this.pagination.value, page };
    this.fetchCurrent();
  };

  onFilter = (keyword: string): void => {
    this.keyword.value = keyword;
    // 过滤后回到第 1 页
    this.pagination.value = { ...this.pagination.value, page: 1 };
    this.fetchCurrent();
  };

  onRefresh = (): void => {
    this.fetchCurrent();
  };

  private fetchCurrent(): void {
    const { page, pageSize } = this.pagination.value;
    this.loading.value = true;
    this.fetcher
      .fetch(this.name, this.keyword.value, page, pageSize)
      .then((result) => {
        this.options.value = [...result.data];
        this.pagination.value = {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
        };
      })
      .finally(() => {
        this.loading.value = false;
      });
  }
}
