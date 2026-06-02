import type { TextAreaProperties } from '@sisyphus/core';
import type { ResolvedSisyphusAntdConfig } from '../config/useSisyphusAntdConfig';

/** antd Input.TextArea 组件属性 */
export interface AntdTextAreaProps {
  readonly value: string | undefined;
  readonly onChange: (e: { target: { value: string } }) => void;
  readonly name: string;
  readonly rows: number;
  readonly placeholder: string;
  readonly allowClear: boolean;
  readonly maxLength?: number;
  readonly size?: 'small' | 'middle' | 'large';
}

/** TextArea → antd Input.TextArea 属性映射器 */
export class TextAreaPropsMapper {
  mapToProps(
    properties: TextAreaProperties,
    config: ResolvedSisyphusAntdConfig,
    value: unknown,
    onChange: (value: unknown) => void
  ): AntdTextAreaProps {
    const constraints = properties.constraints;

    const mapped: AntdTextAreaProps = {
      value: value as string | undefined,
      onChange: (e: { target: { value: string } }) => onChange(e.target.value),
      name: properties.name,
      rows: 4,
      placeholder: `${config.placeholderTemplate.input}${properties.title}`,
      allowClear: true,
      size: config.size,
    };

    if (constraints && typeof constraints.max === 'number') {
      return { ...mapped, maxLength: constraints.max };
    }

    return mapped;
  }
}
