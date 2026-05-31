import { signal, effectScope } from 'alien-signals';
import type { IPaginatedFilterableDynamicResource, Pagination } from '../types/Resource';
import type { PaginatedFilterableFetcher, FieldDataSource } from '../types/Fetcher';

/**
 * 分页+过滤动态资源实现
 */
export class PaginatedFilterableResource<T extends FieldDataSource = FieldDataSource>
  implements IPaginatedFilterableDynamicResource<T>
{
  readonly name: string;
  readonly loading: IPaginatedFilterableDynamicResource<T>['loading'];
  readonly options: IPaginatedFilterableDynamicResource<T>['options'];
  readonly pagination: IPaginatedFilterableDynamicResource<T>['pagination'];
  readonly keyword: IPaginatedFilterableDynamicResource<T>['keyword'];
  private readonly _loading: ReturnType<typeof signal<boolean>>;
  private readonly _options: ReturnType<typeof signal<readonly T[]>>;
  private readonly _pagination: ReturnType<typeof signal<Pagination>>;
  private readonly _keyword: ReturnType<typeof signal<string>>;
  private readonly _fetcher: PaginatedFilterableFetcher<T>;
  private readonly _stopScope: () => void;

  constructor(name: string, fetcher: PaginatedFilterableFetcher<T>, defaultPageSize = 20) {
    this.name = name;
    this._fetcher = fetcher;
    this._loading = signal(false);
    this._options = signal<readonly T[]>([] as readonly T[]);
    this._pagination = signal<Pagination>({ page: 1, pageSize: defaultPageSize, total: 0 });
    this._keyword = signal('');
    this.loading = this._loading;
    this.options = this._options;
    this.pagination = this._pagination;
    this.keyword = this._keyword;
    this._stopScope = effectScope(() => {
      this.onRefresh();
    });
  }

  onFlip = (page: number): void => {
    const current = this._pagination();
    this._pagination({ ...current, page });
    this._fetch();
  };

  onFilter = (keyword: string): void => {
    this._keyword(keyword);
    // 重置到第一页
    const current = this._pagination();
    this._pagination({ ...current, page: 1 });
    this._fetch();
  };

  onRefresh = (): void => {
    this._fetch();
  };

  private async _fetch(): Promise<void> {
    this._loading(true);
    try {
      const result = await this._fetcher.fetch(
        this._keyword(),
        this._pagination().page,
        this._pagination().pageSize
      );
      this._options(result.data as readonly T[]);
      const current = this._pagination();
      this._pagination({ ...current, total: result.total });
    } finally {
      this._loading(false);
    }
  }

  /**
   * 释放资源
   */
  dispose(): void {
    this._stopScope();
  }
}