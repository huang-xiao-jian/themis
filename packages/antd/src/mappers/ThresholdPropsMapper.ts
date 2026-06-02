import type { ThresholdComponentProperties } from '@sisyphus/core';
import type { ResolvedSisyphusAntdConfig } from '../config/useSisyphusAntdConfig';
import type { AntdInputNumberProps } from './InputNumberPropsMapper';
import { InputNumberPropsMapper } from './InputNumberPropsMapper';
import type { AntdInputProps } from './InputPropsMapper';
import { InputPropsMapper } from './InputPropsMapper';
import type { PickerMappingResult } from './PickerPropsMapper';
import { PickerPropsMapper } from './PickerPropsMapper';
import type { RangeInputMappingResult } from './RangeInputPropsMapper';
import { RangeInputPropsMapper } from './RangeInputPropsMapper';
import type { RangePickerMappingResult } from './RangePickerPropsMapper';
import { RangePickerPropsMapper } from './RangePickerPropsMapper';
import type { SelectMappingResult } from './SelectPropsMapper';
import { MultipleSelectPropsMapper, SelectPropsMapper } from './SelectPropsMapper';
import type { AntdSwitchProps } from './SwitchPropsMapper';
import { SwitchPropsMapper } from './SwitchPropsMapper';
import type { AntdTextAreaProps } from './TextAreaPropsMapper';
import { TextAreaPropsMapper } from './TextAreaPropsMapper';

/** 表单组件属性映射结果（按 type 分发） */
export type ThresholdMappingResult =
  | { readonly kind: 'Input'; readonly props: AntdInputProps }
  | { readonly kind: 'InputNumber'; readonly props: AntdInputNumberProps }
  | { readonly kind: 'TextArea'; readonly props: AntdTextAreaProps }
  | { readonly kind: 'RangeInput'; readonly props: RangeInputMappingResult }
  | { readonly kind: 'Switch'; readonly props: AntdSwitchProps }
  | { readonly kind: 'Select'; readonly props: SelectMappingResult }
  | { readonly kind: 'MultipleSelect'; readonly props: SelectMappingResult }
  | { readonly kind: 'Picker'; readonly result: PickerMappingResult }
  | { readonly kind: 'RangePicker'; readonly result: RangePickerMappingResult }
  | { readonly kind: 'ListBuilder'; readonly properties: ThresholdComponentProperties }
  | { readonly kind: 'ListRangeBuilder'; readonly properties: ThresholdComponentProperties };

/** 门面类：按 type 分发到具体 Mapper */
export class ThresholdPropsMapper {
  private readonly inputMapper = new InputPropsMapper();
  private readonly inputNumberMapper = new InputNumberPropsMapper();
  private readonly textAreaMapper = new TextAreaPropsMapper();
  private readonly rangeInputMapper = new RangeInputPropsMapper();
  private readonly switchMapper = new SwitchPropsMapper();
  private readonly selectMapper = new SelectPropsMapper();
  private readonly multipleSelectMapper = new MultipleSelectPropsMapper();
  private readonly pickerMapper = new PickerPropsMapper();
  private readonly rangePickerMapper = new RangePickerPropsMapper();

  mapToProps(
    properties: ThresholdComponentProperties,
    config: ResolvedSisyphusAntdConfig,
    value: unknown,
    onChange: (value: unknown) => void
  ): ThresholdMappingResult {
    switch (properties.type) {
      case 'Input':
        return {
          kind: 'Input',
          props: this.inputMapper.mapToProps(properties, config, value, onChange),
        };
      case 'InputNumber':
        return {
          kind: 'InputNumber',
          props: this.inputNumberMapper.mapToProps(properties, config, value, onChange),
        };
      case 'TextArea':
        return {
          kind: 'TextArea',
          props: this.textAreaMapper.mapToProps(properties, config, value, onChange),
        };
      case 'RangeInput':
        return {
          kind: 'RangeInput',
          props: this.rangeInputMapper.mapToProps(properties, config, value, onChange),
        };
      case 'Switch':
        return {
          kind: 'Switch',
          props: this.switchMapper.mapToProps(properties, config, value, onChange),
        };
      case 'Select':
        return {
          kind: 'Select',
          props: this.selectMapper.mapToProps(properties, config),
        };
      case 'MultipleSelect':
        return {
          kind: 'MultipleSelect',
          props: this.multipleSelectMapper.mapToProps(properties, config),
        };
      case 'Picker':
        return {
          kind: 'Picker',
          result: this.pickerMapper.mapToProps(properties, config, value, onChange),
        };
      case 'RangePicker':
        return {
          kind: 'RangePicker',
          result: this.rangePickerMapper.mapToProps(properties, config, value, onChange),
        };
      case 'ListBuilder':
        return { kind: 'ListBuilder', properties };
      case 'ListRangeBuilder':
        return { kind: 'ListRangeBuilder', properties };
      default: {
        const exhaustiveCheck: never = properties;
        throw new Error(`[sisyphus] Unknown threshold component type: ${exhaustiveCheck}`);
      }
    }
  }
}
