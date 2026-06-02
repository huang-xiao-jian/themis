import { DatePicker, Select, Slider, TimePicker } from 'antd';
import type { ReactElement } from 'react';
import type { PickerMappingResult } from '../mappers/PickerPropsMapper';

/** PickerField 属性 */
interface PickerFieldProps {
  readonly mapping: PickerMappingResult;
}

/** Picker 组件 - 按 semantic 路由到 antd 组件 */
export function PickerField({ mapping }: PickerFieldProps): ReactElement {
  const { componentKind, props } = mapping;

  switch (componentKind) {
    case 'Select':
      return <Select {...props} />;
    case 'DatePicker':
      return <DatePicker {...props} />;
    case 'TimePicker':
      return <TimePicker {...props} />;
    case 'Slider':
      return <Slider {...props} />;
    default: {
      const exhaustiveCheck: never = componentKind;
      throw new Error(`[sisyphus] Unknown picker component kind: ${exhaustiveCheck}`);
    }
  }
}
