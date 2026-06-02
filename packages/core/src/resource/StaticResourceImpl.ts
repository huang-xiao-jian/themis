import { signal, type Signal } from '@preact/signals-core';
import type { StaticResource } from './StaticResource';

/**
 * 静态资源实现
 *
 * 构造时拷贝 options 到 Signal；onFiltrate 把 options 过滤为只含匹配项
 */
export class StaticResourceImpl<T> implements StaticResource<T> {
  readonly name: string;
  readonly options: Signal<readonly T[]>;
  private readonly sourceOptions: readonly T[];

  constructor(name: string, options: readonly T[]) {
    this.name = name;
    this.sourceOptions = options;
    this.options = signal<readonly T[]>([...options]);
  }

  onFiltrate = (value: string | number): void => {
    const matched = this.sourceOptions.filter(
      (opt) => (opt as { value: string | number }).value === value
    );
    this.options.value = matched;
  };
}
