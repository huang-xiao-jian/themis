import { signal, effectScope } from 'alien-signals';
import type { IFilterableDynamicResource } from '../types/Resource';
import type { FilterableFetcher, FieldDataSource } from '../types/Fetcher';

/**
 * 过滤动态资源实现
 */
export class FilterableResource<T extends FieldDataSource = FieldDataSource>
  implements IFilterableDynamicResource<T>
{
  readonly name: string;
  readonly loading: IFilterableDynamicResource<T>['loading'];
  readonly options: IFilterableDynamicResource<T>['options'];
  private readonly _loading: ReturnType<typeof signal<boolean>>;
  private readonly _options: ReturnType<typeof signal<readonly T[]>>;
  private readonly _fetcher: FilterableFetcher<T>;
  private readonly _stopScope: () => void;

  constructor(name: string, fetcher: FilterableFetcher<T>) {
    this.name = name;
    this._fetcher = fetcher;
    this._loading = signal(false);
    this._options = signal<readonly T[]>([]);
    this.loading = this._loading;
    this.options = this._options;
    this._stopScope = effectScope(() => {
      this.onRefresh();
    });
  }

  onFilter = (keyword: string): void => {
    this._fetch(keyword);
  };

  onRefresh = (): void => {
    this._fetch('');
  };

  private async _fetch(keyword = ''): Promise<void> {
    this._loading(true);
    try {
      const data = await this._fetcher.fetch(keyword);
      this._options(data);
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