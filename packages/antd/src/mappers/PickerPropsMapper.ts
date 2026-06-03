import type { PickerProperties } from '@sisyphus/core';
import { Semantic } from '@sisyphus/core';
import type { ResolvedSisyphusAntdConfig } from '../config/useSisyphusAntdConfig';

/** Picker 映射结果组件标识 */
export type PickerComponentKind = 'Select' | 'DatePicker' | 'TimePicker' | 'Slider';

/** Picker 映射结果 */
export interface PickerMappingResult {
  readonly componentKind: PickerComponentKind;
  readonly props: Record<string, unknown>;
}

/** Picker → antd 组件属性映射器 */
export class PickerPropsMapper {
  mapToProps(
    properties: PickerProperties,
    config: ResolvedSisyphusAntdConfig,
    value: unknown,
    onChange: (value: unknown) => void
  ): PickerMappingResult {
    const semantic = properties.semantic;
    const constraints = properties.constraints;

    switch (semantic) {
      case Semantic.RATE:
        return {
          componentKind: 'Select',
          props: {
            value: value as string | number | undefined,
            onChange,
            showSearch: true,
            placeholder: `${config.placeholderTemplate.select}${properties.title}`,
            allowClear: true,
            size: config.size,
          },
        };

      case Semantic.DATE:
        return {
          componentKind: 'DatePicker',
          props: {
            value: value as unknown,
            onChange: (date: unknown) => onChange(date),
            format: constraints?.format,
            placeholder: `${config.placeholderTemplate.select}${properties.title}`,
            autoComplete: 'off',
            size: config.size,
          },
        };

      case Semantic.TIME:
        return {
          componentKind: 'TimePicker',
          props: {
            value: value as unknown,
            onChange: (time: unknown) => onChange(time),
            format: constraints?.format,
            placeholder: `${config.placeholderTemplate.select}${properties.title}`,
            autoComplete: 'off',
            size: config.size,
          },
        };

      case Semantic.DATETIME:
        return {
          componentKind: 'DatePicker',
          props: {
            value: value as unknown,
            onChange: (date: unknown) => onChange(date),
            showTime: true,
            format: constraints?.format,
            placeholder: `${config.placeholderTemplate.select}${properties.title}`,
            autoComplete: 'off',
            size: config.size,
          },
        };

      case Semantic.PERCENTAGE:
        return {
          componentKind: 'Slider',
          props: {
            value: value as number | undefined,
            onChange: (val: number) => onChange(val),
            min: typeof constraints?.min === 'number' ? constraints.min : 0,
            max: typeof constraints?.max === 'number' ? constraints.max : 100,
            step: constraints?.step ?? 1,
          },
        };

      default:
        // Fallback to DatePicker for unknown semantic
        return {
          componentKind: 'DatePicker',
          props: {
            value: value as unknown,
            onChange: (date: unknown) => onChange(date),
            placeholder: `${config.placeholderTemplate.select}${properties.title}`,
            autoComplete: 'off',
            size: config.size,
          },
        };
    }
  }
}
