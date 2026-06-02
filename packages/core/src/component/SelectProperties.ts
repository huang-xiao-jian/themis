import type { Signal } from '@preact/signals-core';
import type { BaseProperties } from './BaseProperties';

/**
 * 静态资源接口的形状（用于类型声明，不在此模块强依赖）
 */
export interface StaticResourceShape<T> {
  readonly name: string;
  readonly options: Signal<readonly T[]>;
  onFiltrate: (value: string | number) => void;
}

/**
 * 基础动态资源接口的形状
 */
export interface ElementaryDynamicResourceShape<T> {
  readonly name: string;
  readonly loading: Signal<boolean>;
  readonly options: Signal<readonly T[]>;
  onRefresh: () => void;
  onFiltrate: (value: string | number) => void;
}

/**
 * 单选下拉
 *
 * 适用场景：factor.resource 存在 + quantity=single
 */
export interface SelectProperties extends BaseProperties {
  readonly type: 'Select';
  readonly resource: StaticResourceShape<unknown> | ElementaryDynamicResourceShape<unknown>;
}
