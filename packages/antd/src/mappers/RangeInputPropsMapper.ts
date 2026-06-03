import type { RangeInputProperties } from '@sisyphus/core';
import { DataType } from '@sisyphus/core';
import type { ResolvedSisyphusAntdConfig } from '../config/useSisyphusAntdConfig';

/** 区间输入映射结果 */
export interface RangeInputMappingResult {
  readonly isNumber: boolean;
  readonly minValue: string | number | undefined;
  readonly maxValue: string | number | undefined;
  readonly onMinChange: (value: string | number) => void;
  readonly onMaxChange: (value: string | number) => void;
  readonly minPlaceholder: string;
  readonly maxPlaceholder: string;
  readonly allowClear: boolean;
  readonly size?: 'small' | 'middle' | 'large';
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly precision?: number;
}

/** RangeInput → 双框 antd Input / InputNumber 属性映射器 */
export class RangeInputPropsMapper {
  mapToProps(
    properties: RangeInputProperties,
    config: ResolvedSisyphusAntdConfig,
    value: unknown,
    onChange: (value: unknown) => void
  ): RangeInputMappingResult {
    const isNumber = properties.dataType === DataType.NUMBER;
    const rangeValue = Array.isArray(value) ? value : [undefined, undefined];

    const constraints = properties.constraints;

    return {
      isNumber,
      minValue: rangeValue[0] as string | number | undefined,
      maxValue: rangeValue[1] as string | number | undefined,
      onMinChange: (minVal: string | number) => {
        onChange([minVal, rangeValue[1]]);
      },
      onMaxChange: (maxVal: string | number) => {
        onChange([rangeValue[0], maxVal]);
      },
      minPlaceholder: '最小值',
      maxPlaceholder: '最大值',
      allowClear: true,
      size: config.size,
      ...(isNumber && constraints
        ? {
            ...(typeof constraints.min === 'number' ? { min: constraints.min } : {}),
            ...(typeof constraints.max === 'number' ? { max: constraints.max } : {}),
            ...(typeof constraints.step === 'number' ? { step: constraints.step } : {}),
            ...(typeof constraints.precision === 'number'
              ? { precision: constraints.precision }
              : {}),
          }
        : {}),
    };
  }
}
