import type { Signal } from '@preact/signals-core';
import type { BaseProperties } from './BaseProperties';

/**
 * 多选下拉
 *
 * 适用场景：factor.resource 存在 + quantity=multiple
 */
export interface MultipleSelectProperties extends BaseProperties {
  readonly type: 'MultipleSelect';
  readonly resource:
    | {
        readonly name: string;
        readonly options: Signal<readonly unknown[]>;
        onFiltrate: (value: string | number) => void;
      }
    | {
        readonly name: string;
        readonly loading: Signal<boolean>;
        readonly options: Signal<readonly unknown[]>;
        onRefresh: () => void;
        onFiltrate: (value: string | number) => void;
      };
}
