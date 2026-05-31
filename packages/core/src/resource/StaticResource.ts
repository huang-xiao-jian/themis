import { signal } from 'alien-signals';
import type { IStaticResource } from '../types/Resource';
import type { FieldDataSource } from '../types/Fetcher';

/**
 * 静态资源实现
 */
export class StaticResource<T extends FieldDataSource = FieldDataSource> implements IStaticResource<T> {
  readonly name: string;
  readonly options: IStaticResource<T>['options'];
  private readonly _options: ReturnType<typeof signal<readonly T[]>>;

  constructor(name: string, data: T[] = []) {
    this.name = name;
    this._options = signal(data as readonly T[]);
    this.options = this._options;
  }

  onFiltrate = (_value: string | number): void => {
    // 静态资源不支持服务端过滤，本地筛选由组件层处理
  };

  /**
   * 设置选项数据
   */
  setOptions(data: T[]): void {
    this._options(data as readonly T[]);
  }

  /**
   * 更新选项数据
   */
  updateOptions(updater: (prev: readonly T[]) => readonly T[]): void {
    const current = this._options();
    this._options(updater(current));
  }
}