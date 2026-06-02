import type { RangeInputProperties } from '@sisyphus/core';
import { DataType } from '@sisyphus/core';
import type { ResolvedSisyphusAntdConfig } from '../config/useSisyphusAntdConfig';

/** 区间输入映射结果 */
export interface RangeInputMappingResult {
  readonly minValue: string | number | undefined;
  readonly maxValue: string | number | undefined;
  readonly onMinChange: (value: string | number) => void;
  readonly onMaxChange: (value: string | number) => void;
  readonly inputType: 'text' | 'number';
  readonly minPlaceholder: string;
  readonly maxPlaceholder: string;
  readonly allowClear: boolean;
  readonly size?: 'small' | 'middle' | 'large';
}

/** RangeInput → 双框 antd Input 属性映射器 */
export class RangeInputPropsMapper {
  mapToProps(
    properties: RangeInputProperties,
    config: ResolvedSisyphusAntdConfig,
    value: unknown,
    onChange: (value: unknown) => void
  ): RangeInputMappingResult {
    const isNumber = properties.dataType === DataType.NUMBER;
    const rangeValue = Array.isArray(value) ? value : [undefined, undefined];

    return {
      minValue: rangeValue[0] as string | number | undefined,
      maxValue: rangeValue[1] as string | number | undefined,
      onMinChange: (minVal: string | number) => {
        onChange([minVal, rangeValue[1]]);
      },
      onMaxChange: (maxVal: string | number) => {
        onChange([rangeValue[0], maxVal]);
      },
      inputType: isNumber ? 'number' : 'text',
      minPlaceholder: '最小值',
      maxPlaceholder: '最大值',
      allowClear: true,
      size: config.size,
    };
  }
}
