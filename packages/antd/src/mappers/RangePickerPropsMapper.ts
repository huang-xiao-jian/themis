import type { RangePickerProperties } from '@sisyphus/core';
import { Semantic } from '@sisyphus/core';
import type { ResolvedSisyphusAntdConfig } from '../config/useSisyphusAntdConfig';
import { fromDayjsRange, toDayjsRange } from '../utils/dayjsValue';

/** RangePicker 映射结果组件标识 */
export type RangePickerComponentKind = 'RangePicker' | 'Slider';

/** RangePicker 映射结果 */
export interface RangePickerMappingResult {
  readonly componentKind: RangePickerComponentKind;
  readonly props: Record<string, unknown>;
}

/** RangePicker → antd 组件属性映射器 */
export class RangePickerPropsMapper {
  mapToProps(
    properties: RangePickerProperties,
    config: ResolvedSisyphusAntdConfig,
    value: unknown,
    onChange: (value: unknown) => void
  ): RangePickerMappingResult {
    const semantic = properties.semantic;
    const constraints = properties.constraints;

    switch (semantic) {
      case Semantic.DATE:
        return {
          componentKind: 'RangePicker',
          props: {
            value: toDayjsRange(value),
            onChange: (dates: unknown) => onChange(fromDayjsRange(dates)),
            placeholder: [
              `${config.placeholderTemplate.select}开始${properties.title}`,
              `${config.placeholderTemplate.select}结束${properties.title}`,
            ],
            autoComplete: ['off', 'off'],
            size: config.size,
          },
        };

      case Semantic.DATETIME:
        return {
          componentKind: 'RangePicker',
          props: {
            value: toDayjsRange(value),
            onChange: (dates: unknown) => onChange(fromDayjsRange(dates)),
            showTime: true,
            placeholder: [
              `${config.placeholderTemplate.select}开始${properties.title}`,
              `${config.placeholderTemplate.select}结束${properties.title}`,
            ],
            autoComplete: ['off', 'off'],
            size: config.size,
          },
        };

      case Semantic.PERCENTAGE:
        return {
          componentKind: 'Slider',
          props: {
            value: value as [number, number] | undefined,
            onChange: (val: [number, number]) => onChange(val),
            range: true,
            min: typeof constraints?.min === 'number' ? constraints.min : 0,
            max: typeof constraints?.max === 'number' ? constraints.max : 100,
            step: constraints?.step ?? 1,
          },
        };

      default:
        return {
          componentKind: 'RangePicker',
          props: {
            value: toDayjsRange(value),
            onChange: (dates: unknown) => onChange(fromDayjsRange(dates)),
            placeholder: [
              `${config.placeholderTemplate.select}开始`,
              `${config.placeholderTemplate.select}结束`,
            ],
            autoComplete: ['off', 'off'],
            size: config.size,
          },
        };
    }
  }
}
