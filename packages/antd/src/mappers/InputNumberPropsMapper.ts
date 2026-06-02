import type { InputNumberProperties } from '@sisyphus/core';
import type { ResolvedSisyphusAntdConfig } from '../config/useSisyphusAntdConfig';

/** antd InputNumber 组件属性 */
export interface AntdInputNumberProps {
  readonly value: number | undefined;
  readonly onChange: (value: number | null) => void;
  readonly name: string;
  readonly placeholder: string;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly precision?: number;
  readonly size?: 'small' | 'middle' | 'large';
}

/** InputNumber → antd InputNumber 属性映射器 */
export class InputNumberPropsMapper {
  mapToProps(
    properties: InputNumberProperties,
    config: ResolvedSisyphusAntdConfig,
    value: unknown,
    onChange: (value: unknown) => void
  ): AntdInputNumberProps {
    const constraints = properties.constraints;

    const mapped: AntdInputNumberProps = {
      value: value as number | undefined,
      onChange: (v: number | null) => {
        onChange(v === null ? undefined : v);
      },
      name: properties.name,
      placeholder: `${config.placeholderTemplate.input}${properties.title}`,
      size: config.size,
    };

    if (constraints) {
      const result: Record<string, unknown> = {};
      if (typeof constraints.min === 'number') result.min = constraints.min;
      if (typeof constraints.max === 'number') result.max = constraints.max;
      if (typeof constraints.step === 'number') result.step = constraints.step;
      if (typeof constraints.precision === 'number') result.precision = constraints.precision;
      return { ...mapped, ...result } as AntdInputNumberProps;
    }

    return mapped;
  }
}
