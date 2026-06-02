import type { BaseProperties } from './BaseProperties'

/**
 * 选择器
 *
 * 适用场景：factor.semantic 存在 + mode=point + quantity=single
 * 适配层根据 semantic 路由到 DatePicker / TimePicker / Slider 等
 */
export interface PickerProperties extends BaseProperties {
  readonly type: 'Picker'
}
