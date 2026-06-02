import type { BaseProperties } from './BaseProperties';

/**
 * 区间输入
 *
 * 适用场景：string/number + manual + range + single
 */
export interface RangeInputProperties extends BaseProperties {
  readonly type: 'RangeInput';
}
