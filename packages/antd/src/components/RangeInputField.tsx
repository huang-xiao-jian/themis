import { Input, Space } from 'antd';
import type { ReactElement } from 'react';
import type { RangeInputMappingResult } from '../mappers/RangeInputPropsMapper';

/** RangeInput 属性 */
interface RangeInputFieldProps {
  readonly mapping: RangeInputMappingResult;
}

/** 区间输入组件 - 双框 antd Input */
export function RangeInputField({ mapping }: RangeInputFieldProps): ReactElement {
  return (
    <Space>
      <Input
        type={mapping.inputType}
        value={mapping.minValue ?? ''}
        onChange={(e) => {
          const raw = e.target.value;
          mapping.onMinChange(mapping.inputType === 'number' ? Number(raw) : raw);
        }}
        placeholder={mapping.minPlaceholder}
        allowClear={mapping.allowClear}
        size={mapping.size}
        style={{ width: 120 }}
      />
      <span>~</span>
      <Input
        type={mapping.inputType}
        value={mapping.maxValue ?? ''}
        onChange={(e) => {
          const raw = e.target.value;
          mapping.onMaxChange(mapping.inputType === 'number' ? Number(raw) : raw);
        }}
        placeholder={mapping.maxPlaceholder}
        allowClear={mapping.allowClear}
        size={mapping.size}
        style={{ width: 120 }}
      />
    </Space>
  );
}
