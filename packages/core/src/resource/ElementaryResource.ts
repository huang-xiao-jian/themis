import { signal, effectScope } from 'alien-signals';
import type { IElementaryDynamicResource } from '../types/Resource';
import type { ElementaryFetcher, FieldDataSource } from '../types/Fetcher';

/**
 * 基础动态资源实现
 */
export class ElementaryResource<T extends FieldDataSource = FieldDataSource>
  implements IElementaryDynamicResource<T>
{
  readonly name: string;
  readonly loading: IElementaryDynamicResource<T>['loading'];
  readonly options: IElementaryDynamicResource<T>['options'];
  private readonly _loading: ReturnType<typeof signal<boolean>>;
  private readonly _options: ReturnType<typeof signal<readonly T[]>>;
  private readonly _fetcher: ElementaryFetcher<T>;
  private readonly _stopScope: () => void;

  constructor(name: string, fetcher: ElementaryFetcher<T>) {
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

  onRefresh = (): void => {
    this._fetch();
  };

  onFiltrate = (_value: string | number): void => {
    // 基础动态资源不支持服务端过滤，本地筛选由组件层处理
  };

  private async _fetch(): Promise<void> {
    this._loading(true);
    try {
      const data = await this._fetcher.fetch();
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