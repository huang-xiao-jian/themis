import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useSignals } from '@preact/signals-react/runtime';
import { Show } from '@preact/signals-react/utils';
import type { AtomicRuleViewProperties } from '@sisyphus/react';
import { Button, Col, Flex, Row } from 'antd';
import type { ReactElement } from 'react';
import { useSisyphusAntdConfig } from '../config/useSisyphusAntdConfig';
import { RuleNameSelect } from './formily/RuleNameSelect';
import { RuleOperatorSelect } from './formily/RuleOperatorSelect';
import { RuleThresholdRenderer } from './formily/RuleThreshold';

/** antd 原子规则编辑器视图，使用 Row/Col Grid 布局渲染完整行 */
export function AntdAtomicRuleView({ scheduler }: AtomicRuleViewProperties): ReactElement {
  useSignals();
  const config = useSisyphusAntdConfig();
  const layout = config.atomicRuleLayout;
  const editable = scheduler.editable.value;

  return (
    <Row gutter={layout.gutter} align="middle" wrap={false}>
      <Col flex={layout.name}>
        <RuleNameSelect
          allowClear
          placeholder={`${config.placeholderTemplate.select}`}
          size={config.size}
          style={{ width: '100%' }}
          showSearch={{
            filterOption: (input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false,
          }}
        />
      </Col>
      <Col flex={layout.operator}>
        <RuleOperatorSelect
          allowClear
          size={config.size}
          style={{ width: '100%' }}
          placeholder={`${config.placeholderTemplate.select}`}
        />
      </Col>
      <Col flex={layout.threshold}>
        <RuleThresholdRenderer />
      </Col>
      <Col flex={layout.action}>
        <Show when={scheduler.interactive}>
          <Flex gap="small">
            <Show
              when={scheduler.editable}
              fallback={<Button type="text" icon={<EditOutlined />} onClick={scheduler.onEdit} />}
            >
              <Button type="text" icon={<CheckOutlined />} onClick={scheduler.onOk} />
              <Button type="text" icon={<CloseOutlined />} onClick={scheduler.onCancel} />
            </Show>
            <Button type="text" danger icon={<DeleteOutlined />} onClick={scheduler.onRemove} />
          </Flex>
        </Show>
      </Col>
    </Row>
  );
}
