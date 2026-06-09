import type {
  MultipleSelectProperties,
  SelectProperties,
  ThresholdComponentProperties,
} from '@sisyphus/core';
import { Input, InputNumber, Switch } from 'antd';
import type { ReactElement } from 'react';
import { useSisyphusAntdConfig } from '../config/useSisyphusAntdConfig';
import { RangeInputPropsMapper } from '../mappers/RangeInputPropsMapper';
import { ThresholdPropsMapper } from '../mappers/ThresholdPropsMapper';
import { ListBuilderField } from './ListBuilderField';
import { ListRangeBuilderField } from './ListRangeBuilderField';
import { PickerField } from './PickerField';
import { RangeInputField } from './RangeInputField';
import { RangePickerField } from './RangePickerField';
import { SelectField } from './SelectField';

const { TextArea } = Input;

/** ThresholdRenderer 属性 */
export interface ThresholdRendererProps {
  readonly properties: ThresholdComponentProperties;
  readonly value: unknown;
  readonly onChange: (value: unknown) => void;
  readonly disabled?: boolean;
}

const propsMapper = new ThresholdPropsMapper();
const rangeInputMapper = new RangeInputPropsMapper();

/** 表单组件路由：根据 type 渲染对应 antd 组件 */
export function ThresholdRenderer({
  properties,
  value,
  onChange,
  disabled,
}: ThresholdRendererProps): ReactElement {
  const config = useSisyphusAntdConfig();
  const result = propsMapper.mapToProps(properties, config, value, onChange);

  switch (result.kind) {
    case 'Input':
      return (
        <Input
          value={result.props.value ?? ''}
          onChange={result.props.onChange}
          name={result.props.name}
          type={result.props.type}
          placeholder={result.props.placeholder}
          allowClear={result.props.allowClear}
          autoComplete="off"
          size={result.props.size}
          minLength={result.props.minLength}
          maxLength={result.props.maxLength}
          disabled={disabled}
          style={{ width: '100%' }}
        />
      );

    case 'InputNumber':
      return (
        <InputNumber
          value={result.props.value}
          onChange={result.props.onChange}
          name={result.props.name}
          placeholder={result.props.placeholder}
          autoComplete="off"
          min={result.props.min}
          max={result.props.max}
          step={result.props.step}
          precision={result.props.precision}
          size={result.props.size}
          disabled={disabled}
          style={{ width: '100%' }}
        />
      );

    case 'TextArea':
      return (
        <TextArea
          value={result.props.value ?? ''}
          onChange={result.props.onChange}
          name={result.props.name}
          rows={result.props.rows}
          placeholder={result.props.placeholder}
          allowClear={result.props.allowClear}
          autoComplete="off"
          maxLength={result.props.maxLength}
          size={result.props.size}
          disabled={disabled}
          style={{ width: '100%' }}
        />
      );

    case 'RangeInput':
      return <RangeInputField mapping={result.props} disabled={disabled} />;

    case 'Switch':
      return (
        <Switch
          checked={result.props.checked}
          onChange={result.props.onChange}
          checkedChildren={result.props.checkedChildren}
          unCheckedChildren={result.props.unCheckedChildren}
          size={result.props.size}
          disabled={disabled}
        />
      );

    case 'Select':
      return (
        <SelectField
          properties={properties as SelectProperties}
          value={value}
          onChange={onChange}
          placeholder={result.props.placeholder}
          allowClear={result.props.allowClear}
          size={result.props.size}
          disabled={disabled}
        />
      );

    case 'MultipleSelect':
      return (
        <SelectField
          properties={properties as MultipleSelectProperties}
          value={value}
          onChange={onChange}
          placeholder={result.props.placeholder}
          allowClear={result.props.allowClear}
          size={result.props.size}
          mode="multiple"
          disabled={disabled}
        />
      );

    case 'Picker':
      return <PickerField mapping={result.result} disabled={disabled} />;

    case 'RangePicker':
      return <RangePickerField mapping={result.result} disabled={disabled} />;

    case 'ListBuilder':
      return (
        <ListBuilderField
          properties={result.properties as never}
          value={value}
          onChange={onChange}
          size={config.size}
          disabled={disabled}
        />
      );

    case 'ListRangeBuilder':
      return (
        <ListRangeBuilderField
          properties={result.properties as never}
          value={value}
          onChange={onChange}
          size={config.size}
          disabled={disabled}
        />
      );

    default: {
      const exhaustiveCheck: never = result;
      throw new Error(`[sisyphus] Unknown threshold mapping kind: ${exhaustiveCheck}`);
    }
  }
}
