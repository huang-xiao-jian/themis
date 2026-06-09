import { DatePicker, Select, Slider, TimePicker } from 'antd';
import type { ReactElement } from 'react';
import type { PickerMappingResult } from '../mappers/PickerPropsMapper';

/** PickerField 属性 */
interface PickerFieldProps {
  readonly mapping: PickerMappingResult;
  readonly disabled?: boolean;
}

/** Picker 组件 - 按 semantic 路由到 antd 组件 */
export function PickerField({ mapping, disabled }: PickerFieldProps): ReactElement {
  const { componentKind, props } = mapping;

  switch (componentKind) {
    case 'Select':
      return <Select {...props} disabled={disabled} />;
    case 'DatePicker':
      return <DatePicker {...props} disabled={disabled} />;
    case 'TimePicker':
      return <TimePicker {...props} disabled={disabled} />;
    case 'Slider':
      return <Slider {...props} disabled={disabled} />;
    default: {
      const exhaustiveCheck: never = componentKind;
      throw new Error(`[sisyphus] Unknown picker component kind: ${exhaustiveCheck}`);
    }
  }
}
