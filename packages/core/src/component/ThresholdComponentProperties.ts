import type { InputProperties } from './InputProperties'
import type { TextAreaProperties } from './TextAreaProperties'
import type { RangeInputProperties } from './RangeInputProperties'
import type { SwitchProperties } from './SwitchProperties'
import type { SelectProperties } from './SelectProperties'
import type { MultipleSelectProperties } from './MultipleSelectProperties'
import type { PickerProperties } from './PickerProperties'
import type { RangePickerProperties } from './RangePickerProperties'
import type { ListBuilderProperties } from './ListBuilderProperties'
import type { ListRangeBuilderProperties } from './ListRangeBuilderProperties'

/**
 * 表单组件属性联合类型
 *
 * 内核推断器最终产出的中间形态，供适配层（React/antd）映射到具体 UI 组件
 */
export type ThresholdComponentProperties =
  | InputProperties
  | TextAreaProperties
  | RangeInputProperties
  | SwitchProperties
  | SelectProperties
  | MultipleSelectProperties
  | PickerProperties
  | RangePickerProperties
  | ListBuilderProperties
  | ListRangeBuilderProperties
