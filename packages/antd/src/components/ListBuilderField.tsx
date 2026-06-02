import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ListBuilderProperties } from '@sisyphus/core';
import { DataType, Semantic } from '@sisyphus/core';
import {
  Select as AntdSelect,
  Button,
  DatePicker,
  Input,
  InputNumber,
  Slider,
  Space,
  TimePicker,
} from 'antd';
import type { ReactElement } from 'react';
import { useCallback } from 'react';

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
      const isNumber = item.dataType === DataType.NUMBER;
      return (
        <Input
          type={isNumber ? 'number' : 'text'}
          value={(itemValue as string | number | undefined) ?? ''}
          onChange={(e) => {
            const raw = e.target.value;
            onItemChange(isNumber ? (raw === '' ? undefined : Number(raw)) : raw);
          }}
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
          size={size}
          style={{ width: 160 }}
        />
      );
    }
    case 'Picker': {
      const semantic = item.semantic;
      if (semantic === Semantic.DATE) {
        return <DatePicker value={itemValue as never} onChange={onItemChange} size={size} />;
      }
      if (semantic === Semantic.TIME) {
        return <TimePicker value={itemValue as never} onChange={onItemChange} size={size} />;
      }
      if (semantic === Semantic.DATETIME) {
        return (
          <DatePicker value={itemValue as never} onChange={onItemChange} showTime size={size} />
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

  const handleAdd = useCallback(() => {
    const defaultValue = properties.item.dataType === DataType.NUMBER ? undefined : '';
    onChange([...listValue, defaultValue]);
  }, [listValue, onChange, properties.item.dataType]);

  const handleRemove = useCallback(
    (index: number) => {
      const next = listValue.filter((_: unknown, i: number) => i !== index);
      onChange(next);
    },
    [listValue, onChange]
  );

  const handleItemChange = useCallback(
    (index: number, itemValue: unknown) => {
      const next = listValue.map((v: unknown, i: number) => (i === index ? itemValue : v));
      onChange(next);
    },
    [listValue, onChange]
  );

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {listValue.map((itemValue: unknown, index: number) => (
        <Space key={index} align="center">
          {renderListItem(properties.item, itemValue, (v) => handleItemChange(index, v), size)}
          <Button
            type="link"
            icon={<DeleteOutlined />}
            disabled={!canRemove}
            onClick={() => handleRemove(index)}
          />
        </Space>
      ))}
      <Button type="link" icon={<PlusOutlined />} disabled={!canAdd} onClick={handleAdd}>
        添加
      </Button>
    </Space>
  );
}
