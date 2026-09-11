import { type Signal } from '@preact/signals-core';
import type { ElementaryFetcher } from '../fetcher/ElementaryFetcher';
import type { ElementaryDynamicResource } from './DynamicResource';
/**
 * 基础动态资源实现
 *
 * onRefresh 触发 fetch，loading 状态在 fetch 前后切换；错误时 loading 仍需重置
 */
export declare class ElementaryDynamicResourceImpl<T> implements ElementaryDynamicResource<T> {
  readonly name: string;
  readonly loading: Signal<boolean>;
  readonly options: Signal<readonly T[]>;
  private readonly fetcher;
  constructor(name: string, fetcher: ElementaryFetcher<T>);
  onRefresh: () => void;
  onFiltrate: (value: string | number) => void;
}
