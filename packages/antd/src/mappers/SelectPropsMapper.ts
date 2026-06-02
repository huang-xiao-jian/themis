import type { MultipleSelectProperties, SelectProperties } from '@sisyphus/core';
import type { ResolvedSisyphusAntdConfig } from '../config/useSisyphusAntdConfig';

/** Select antd 映射基础属性 */
export interface SelectMappingResult {
  readonly name: string;
  readonly placeholder: string;
  readonly allowClear: boolean;
  readonly size?: 'small' | 'middle' | 'large';
  readonly mode?: 'multiple';
}

/** Select → antd Select 属性映射器 */
export class SelectPropsMapper {
  mapToProps(
    properties: SelectProperties,
    config: ResolvedSisyphusAntdConfig
  ): SelectMappingResult {
    return {
      name: properties.name,
      placeholder: `${config.placeholderTemplate.select}${properties.title}`,
      allowClear: true,
      size: config.size,
    };
  }
}

/** MultipleSelect → antd Select(mode=multiple) 属性映射器 */
export class MultipleSelectPropsMapper {
  mapToProps(
    properties: MultipleSelectProperties,
    config: ResolvedSisyphusAntdConfig
  ): SelectMappingResult {
    return {
      name: properties.name,
      placeholder: `${config.placeholderTemplate.select}${properties.title}`,
      allowClear: true,
      size: config.size,
      mode: 'multiple',
    };
  }
}
