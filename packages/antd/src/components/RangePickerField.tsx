import { DatePicker, Slider } from 'antd';
import type { ReactElement } from 'react';
import type { RangePickerMappingResult } from '../mappers/RangePickerPropsMapper';

const { RangePicker } = DatePicker;

/** RangePickerField 属性 */
interface RangePickerFieldProps {
  readonly mapping: RangePickerMappingResult;
  readonly disabled?: boolean;
}

/** RangePicker 组件 - 按 semantic 路由到 antd 组件 */
export function RangePickerField({ mapping, disabled }: RangePickerFieldProps): ReactElement {
  const { componentKind, props } = mapping;

  switch (componentKind) {
    case 'RangePicker':
      return <RangePicker {...props} disabled={disabled} />;
    case 'Slider':
      return <Slider {...props} disabled={disabled} />;
    default: {
      const exhaustiveCheck: never = componentKind;
      throw new Error(`[sisyphus] Unknown range picker component kind: ${exhaustiveCheck}`);
    }
  }
}
