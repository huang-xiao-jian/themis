import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ListBuilderProperties } from '@sisyphus/core';
import { DataType, Semantic } from '@sisyphus/core';
import {
  Select as AntdSelect,
  Button,
  DatePicker,
  Flex,
  Input,
  InputNumber,
  Slider,
  TimePicker,
} from 'antd';
import type { ReactElement } from 'react';
import { useCallback } from 'react';
import { fromDayjs, toDayjs } from '../utils/dayjsValue';

/** ListBuilderField 属性 */
interface ListBuilderFieldProps {
  readonly properties: ListBuilderProperties;
  readonly value: unknown;
  readonly onChange: (value: unknown) => void;
  readonly size?: 'small' | 'middle' | 'large';
}

/** 渲染列表项组件 */
function renderListItem(
  item: ListBuilderProperties['item'],
  itemValue: unknown,
  onItemChange: (value: unknown) => void,
  size?: 'small' | 'middle' | 'large'
): ReactElement {
  switch (item.type) {
    case 'Input': {
      if (item.dataType === DataType.NUMBER) {
        return (
          <InputNumber
            value={itemValue as number | undefined}
            onChange={(v) => onItemChange(v === null ? undefined : v)}
            min={typeof item.constraints?.min === 'number' ? item.constraints.min : undefined}
            max={typeof item.constraints?.max === 'number' ? item.constraints.max : undefined}
            step={item.constraints?.step}
            precision={item.constraints?.precision}
            size={size}
            style={{ width: 160 }}
          />
        );
      }
      return (
        <Input
          value={(itemValue as string | undefined) ?? ''}
          onChange={(e) => onItemChange(e.target.value)}
          autoComplete="off"
          size={size}
          style={{ width: 160 }}
        />
      );
    }
    case 'InputNumber': {
      return (
        <InputNumber
          value={itemValue as number | undefined}
          onChange={(v) => onItemChange(v === null ? undefined : v)}
          min={typeof item.constraints?.min === 'number' ? item.constraints.min : undefined}
          max={typeof item.constraints?.max === 'number' ? item.constraints.max : undefined}
          step={item.constraints?.step}
          precision={item.constraints?.precision}
          autoComplete="off"
          size={size}
          style={{ width: 160 }}
        />
      );
    }
    case 'Picker': {
      const semantic = item.semantic;
      if (semantic === Semantic.DATE) {
        return (
          <DatePicker
            value={toDayjs(itemValue)}
            onChange={(v) => onItemChange(fromDayjs(v))}
            size={size}
          />
        );
      }
      if (semantic === Semantic.TIME) {
        return (
          <TimePicker
            value={toDayjs(itemValue)}
            onChange={(v) => onItemChange(fromDayjs(v))}
            size={size}
          />
        );
      }
      if (semantic === Semantic.DATETIME) {
        return (
          <DatePicker
            value={toDayjs(itemValue)}
            onChange={(v) => onItemChange(fromDayjs(v))}
            showTime
            size={size}
          />
        );
      }
      if (semantic === Semantic.PERCENTAGE) {
        return (
          <Slider
            value={(itemValue as number) ?? 0}
            onChange={onItemChange}
            min={typeof item.constraints?.min === 'number' ? item.constraints.min : 0}
            max={typeof item.constraints?.max === 'number' ? item.constraints.max : 100}
            step={item.constraints?.step ?? 1}
            style={{ width: 160 }}
          />
        );
      }
      if (semantic === Semantic.RATE) {
        return (
          <AntdSelect
            value={itemValue as string | number | undefined}
            onChange={onItemChange}
            showSearch
            size={size}
            style={{ width: 160 }}
          />
        );
      }
      // Fallback
      return (
        <Input
          value={(itemValue as string | undefined) ?? ''}
          onChange={(e) => onItemChange(e.target.value)}
          autoComplete="off"
          size={size}
          style={{ width: 160 }}
        />
      );
    }
    default:
      return (
        <Input
          value={String(itemValue ?? '')}
          onChange={(e) => onItemChange(e.target.value)}
          autoComplete="off"
          size={size}
        />
      );
  }
}

/** 列表构建器组件 */
export function ListBuilderField({
  properties,
  value,
  onChange,
  size,
}: ListBuilderFieldProps): ReactElement {
  const listValue = Array.isArray(value) ? value : [];
  const minItems = properties.constraints?.minItems ?? 0;
  const maxItems = properties.constraints?.maxItems ?? Infinity;
  const canAdd = listValue.length < maxItems;
  const canRemove = listValue.length > minItems;

  const onAdd = useCallback(() => {
    const defaultValue = properties.item.dataType === DataType.NUMBER ? undefined : '';
    onChange([...listValue, defaultValue]);
  }, [listValue, onChange, properties.item.dataType]);

  const onRemove = useCallback(
    (index: number) => {
      const next = listValue.filter((_: unknown, i: number) => i !== index);
      onChange(next);
    },
    [listValue, onChange]
  );

  const onItemChange = useCallback(
    (index: number, itemValue: unknown) => {
      const next = listValue.map((v: unknown, i: number) => (i === index ? itemValue : v));
      onChange(next);
    },
    [listValue, onChange]
  );

  return (
    <Flex>
      {listValue.map((itemValue: unknown, index: number) => (
        <Flex key={index} align="center">
          {renderListItem(properties.item, itemValue, (v) => onItemChange(index, v), size)}
          <Button
            type="link"
            icon={<DeleteOutlined />}
            disabled={!canRemove}
            onClick={() => onRemove(index)}
          />
        </Flex>
      ))}
      <Button type="link" icon={<PlusOutlined />} disabled={!canAdd} onClick={onAdd}>
        添加
      </Button>
    </Flex>
  );
}
