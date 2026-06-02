import type { BaseProperties } from './BaseProperties';

/**
 * 区间选择器
 *
 * 适用场景：factor.semantic 存在 + mode=range + quantity=single
 */
export interface RangePickerProperties extends BaseProperties {
  readonly type: 'RangePicker';
}
