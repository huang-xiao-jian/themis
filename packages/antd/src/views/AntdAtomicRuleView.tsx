import { DeleteOutlined } from '@ant-design/icons';
import { useSignals } from '@preact/signals-react/runtime';
import type { FieldDataSource } from '@sisyphus/core';
import type { AtomicRuleViewProperties } from '@sisyphus/react';
import { Button, Col, Row, Select } from 'antd';
import type { ReactElement } from 'react';
import { useCallback } from 'react';
import { ThresholdRenderer } from '../components/ThresholdRenderer';
import { useSisyphusAntdConfig } from '../config/useSisyphusAntdConfig';

/** AntdAtomicRuleView 扩展属性 */
interface AntdAtomicRuleViewProps extends AtomicRuleViewProperties {
  /** 可用的规则因子选项（由 AtomicRuleGroupView 传入） */
  readonly factors?: readonly FieldDataSource[];
  /** 删除当前规则的回调 */
  readonly onDelete?: () => void;
}

/** antd 原子规则编辑器视图，使用 Row/Col Grid 布局渲染完整行 */
export function AntdAtomicRuleView({
  scheduler,
  factors = [],
  onDelete,
}: AntdAtomicRuleViewProps): ReactElement {
  useSignals();
  const config = useSisyphusAntdConfig();
  const layout = config.atomicRuleLayout;

  // 读取 Signal.value，useSignals() 已启用自动追踪
  const operators = scheduler.operators.value;
  const thresholder = scheduler.thresholder.value;
  const nameValue = scheduler.name.value;
  const operatorValue = scheduler.operator.value;
  const thresholdValue = scheduler.threshold.value;

  const onNameChange = useCallback(
    (value: string) => {
      scheduler.onFieldChange({ field: 'name', value });
    },
    [scheduler]
  );

  const onOperatorChange = useCallback(
    (value: string) => {
      scheduler.onFieldChange({ field: 'operator', value });
    },
    [scheduler]
  );

  const onThresholdChange = useCallback(
    (value: unknown) => {
      scheduler.onFieldChange({ field: 'threshold', value });
    },
    [scheduler]
  );

  return (
    <Row gutter={layout.gutter} align="middle" wrap={false}>
      <Col flex={layout.name}>
        <Select
          value={nameValue ?? undefined}
          options={[...factors]}
          onChange={onNameChange}
          placeholder={`${config.placeholderTemplate.select}规则因子`}
          allowClear
          size={config.size}
          style={{ width: '100%' }}
          showSearch={{
            filterOption: (input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false,
          }}
        />
      </Col>
      <Col flex={layout.operator}>
        <Select
          value={operatorValue ?? undefined}
          options={[...operators]}
          onChange={onOperatorChange}
          placeholder={`${config.placeholderTemplate.select}操作符`}
          allowClear
          size={config.size}
          style={{ width: '100%' }}
        />
      </Col>
      {thresholder && (
        <Col flex={layout.threshold}>
          <ThresholdRenderer
            properties={thresholder}
            value={thresholdValue}
            onChange={onThresholdChange}
          />
        </Col>
      )}
      <Col flex={layout.action}>
        <Button type="text" danger icon={<DeleteOutlined />} onClick={onDelete} />
      </Col>
    </Row>
  );
}
