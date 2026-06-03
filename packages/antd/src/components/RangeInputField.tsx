import { Input, InputNumber, Space } from 'antd';
import type { ReactElement } from 'react';
import type { RangeInputMappingResult } from '../mappers/RangeInputPropsMapper';

/** RangeInput 属性 */
interface RangeInputFieldProps {
  readonly mapping: RangeInputMappingResult;
}

/** 区间输入组件 - 双框 antd Input / InputNumber */
export function RangeInputField({ mapping }: RangeInputFieldProps): ReactElement {
  if (mapping.isNumber) {
    return (
      <Space>
        <InputNumber
          value={mapping.minValue as number | undefined}
          onChange={(v) => mapping.onMinChange(v ?? '')}
          placeholder={mapping.minPlaceholder}
          min={mapping.min}
          max={mapping.max}
          step={mapping.step}
          precision={mapping.precision}
          size={mapping.size}
          style={{ width: 120 }}
        />
        <span>~</span>
        <InputNumber
          value={mapping.maxValue as number | undefined}
          onChange={(v) => mapping.onMaxChange(v ?? '')}
          placeholder={mapping.maxPlaceholder}
          min={mapping.min}
          max={mapping.max}
          step={mapping.step}
          precision={mapping.precision}
          size={mapping.size}
          style={{ width: 120 }}
        />
      </Space>
    );
  }

  return (
    <Space>
      <Input
        value={(mapping.minValue as string | undefined) ?? ''}
        onChange={(e) => mapping.onMinChange(e.target.value)}
        placeholder={mapping.minPlaceholder}
        allowClear={mapping.allowClear}
        autoComplete="off"
        size={mapping.size}
        style={{ width: 120 }}
      />
      <span>~</span>
      <Input
        value={(mapping.maxValue as string | undefined) ?? ''}
        onChange={(e) => mapping.onMaxChange(e.target.value)}
        placeholder={mapping.maxPlaceholder}
        allowClear={mapping.allowClear}
        autoComplete="off"
        size={mapping.size}
        style={{ width: 120 }}
      />
    </Space>
  );
}
