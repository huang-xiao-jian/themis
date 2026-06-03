import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ListRangeBuilderProperties } from '@sisyphus/core';
import { DataType, Semantic } from '@sisyphus/core';
import { Button, DatePicker, Input, InputNumber, Slider, Space } from 'antd';
import type { ReactElement } from 'react';
import { useCallback } from 'react';

const { RangePicker } = DatePicker;

/** ListRangeBuilderField 属性 */
interface ListRangeBuilderFieldProps {
  readonly properties: ListRangeBuilderProperties;
  readonly value: unknown;
  readonly onChange: (value: unknown) => void;
  readonly size?: 'small' | 'middle' | 'large';
}

/** 渲染区间列表项组件 */
function renderRangeListItem(
  item: ListRangeBuilderProperties['item'],
  itemValue: unknown,
  onItemChange: (value: unknown) => void,
  size?: 'small' | 'middle' | 'large'
): ReactElement {
  switch (item.type) {
    case 'RangeInput': {
      const isNumber = item.dataType === DataType.NUMBER;
      const rangeValue = Array.isArray(itemValue) ? itemValue : [undefined, undefined];
      if (isNumber) {
        return (
          <Space>
            <InputNumber
              value={rangeValue[0] as number | undefined}
              onChange={(v) => onItemChange([v ?? undefined, rangeValue[1]])}
              placeholder="最小值"
              min={typeof item.constraints?.min === 'number' ? item.constraints.min : undefined}
              max={typeof item.constraints?.max === 'number' ? item.constraints.max : undefined}
              step={item.constraints?.step}
              precision={item.constraints?.precision}
              size={size}
              style={{ width: 100 }}
            />
            <span>~</span>
            <InputNumber
              value={rangeValue[1] as number | undefined}
              onChange={(v) => onItemChange([rangeValue[0], v ?? undefined])}
              placeholder="最大值"
              min={typeof item.constraints?.min === 'number' ? item.constraints.min : undefined}
              max={typeof item.constraints?.max === 'number' ? item.constraints.max : undefined}
              step={item.constraints?.step}
              precision={item.constraints?.precision}
              size={size}
              style={{ width: 100 }}
            />
          </Space>
        );
      }
      return (
        <Space>
          <Input
            value={(rangeValue[0] as string | undefined) ?? ''}
            onChange={(e) => onItemChange([e.target.value, rangeValue[1]])}
            placeholder="最小值"
            autoComplete="off"
            size={size}
            style={{ width: 100 }}
          />
          <span>~</span>
          <Input
            value={(rangeValue[1] as string | undefined) ?? ''}
            onChange={(e) => onItemChange([rangeValue[0], e.target.value])}
            placeholder="最大值"
            autoComplete="off"
            size={size}
            style={{ width: 100 }}
          />
        </Space>
      );
    }
    case 'RangePicker': {
      const semantic = item.semantic;
      if (semantic === Semantic.PERCENTAGE) {
        const rangeVal = Array.isArray(itemValue) ? itemValue : [0, 0];
        return (
          <Slider
            range
            value={rangeVal as [number, number]}
            onChange={onItemChange}
            min={typeof item.constraints?.min === 'number' ? item.constraints.min : 0}
            max={typeof item.constraints?.max === 'number' ? item.constraints.max : 100}
            step={item.constraints?.step ?? 1}
            style={{ width: 200 }}
          />
        );
      }
      // date / datetime
      return (
        <RangePicker
          value={itemValue as never}
          onChange={onItemChange}
          showTime={semantic === Semantic.DATETIME}
          size={size}
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

/** 区间列表构建器组件 */
export function ListRangeBuilderField({
  properties,
  value,
  onChange,
  size,
}: ListRangeBuilderFieldProps): ReactElement {
  const listValue = Array.isArray(value) ? value : [];
  const minItems = properties.constraints?.minItems ?? 0;
  const maxItems = properties.constraints?.maxItems ?? Infinity;
  const canAdd = listValue.length < maxItems;
  const canRemove = listValue.length > minItems;

  const onAdd = useCallback(() => {
    const defaultRange =
      properties.item.type === 'RangeInput'
        ? [undefined, undefined]
        : properties.item.semantic === Semantic.PERCENTAGE
          ? [0, 0]
          : [undefined, undefined];
    onChange([...listValue, defaultRange]);
  }, [listValue, onChange, properties.item]);

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
    <Space direction="vertical" style={{ width: '100%' }}>
      {listValue.map((itemValue: unknown, index: number) => (
        <Space key={index} align="center">
          {renderRangeListItem(properties.item, itemValue, (v) => onItemChange(index, v), size)}
          <Button
            type="link"
            icon={<DeleteOutlined />}
            disabled={!canRemove}
            onClick={() => onRemove(index)}
          />
        </Space>
      ))}
      <Button type="link" icon={<PlusOutlined />} disabled={!canAdd} onClick={onAdd}>
        添加
      </Button>
    </Space>
  );
}
