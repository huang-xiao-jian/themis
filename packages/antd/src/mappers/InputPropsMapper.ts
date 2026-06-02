import type { InputProperties } from '@sisyphus/core';
import type { ResolvedSisyphusAntdConfig } from '../config/useSisyphusAntdConfig';

/** antd Input 组件属性 */
export interface AntdInputProps {
  readonly value: string | undefined;
  readonly onChange: (e: { target: { value: string } }) => void;
  readonly name: string;
  readonly type: 'text';
  readonly placeholder: string;
  readonly allowClear: boolean;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly size?: 'small' | 'middle' | 'large';
}

/** Input → antd Input 属性映射器 */
export class InputPropsMapper {
  mapToProps(
    properties: InputProperties,
    config: ResolvedSisyphusAntdConfig,
    value: unknown,
    onChange: (value: unknown) => void
  ): AntdInputProps {
    const constraints = properties.constraints;

    const mapped: AntdInputProps = {
      value: value as string | undefined,
      onChange: (e: { target: { value: string } }) => {
        onChange(e.target.value);
      },
      name: properties.name,
      type: 'text',
      placeholder: `${config.placeholderTemplate.input}${properties.title}`,
      allowClear: true,
      size: config.size,
    };

    if (constraints) {
      let minLength: number | undefined;
      let maxLength: number | undefined;
      if (typeof constraints.min === 'number') {
        minLength = constraints.min;
      }
      if (typeof constraints.max === 'number') {
        maxLength = constraints.max;
      }
      return { ...mapped, minLength, maxLength };
    }

    return mapped;
  }
}
