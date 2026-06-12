import { CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { AtomicRuleScheduler } from '@sisyphus/core';
import { observer, Show } from '@unsignal/react';
import { Button, Col, Flex, Row } from 'antd';
import type { ReactElement } from 'react';
import { useSisyphusAntdConfig } from '../config/useSisyphusAntdConfig';
import { RuleNameSelect } from './formily/RuleNameSelect';
import { RuleOperatorSelect } from './formily/RuleOperatorSelect';
import { RuleThresholdRenderer } from './formily/RuleThreshold';

export interface AntdAtomicRuleViewProps {
  readonly scheduler: AtomicRuleScheduler;
}

/** antd 原子规则编辑器视图，使用 Row/Col Grid 布局渲染完整行 */
export const AntdAtomicRuleView = observer(function AntdAtomicRuleView(
  props: AntdAtomicRuleViewProps
): ReactElement {
  const config = useSisyphusAntdConfig();
  const layout = config.atomicRuleLayout;
  const scheduler = props.scheduler;

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
        <Flex gap="small">
          <Show
            when={scheduler.editable}
            fallback={<Button type="text" icon={<EditOutlined />} onClick={scheduler.onEdit} />}
          >
            {() => (
              <>
                <Button type="text" icon={<CheckOutlined />} onClick={scheduler.onOk} />
                <Button type="text" icon={<CloseOutlined />} onClick={scheduler.onCancel} />
              </>
            )}
          </Show>
          <Button type="text" danger icon={<DeleteOutlined />} onClick={scheduler.onRemove} />
        </Flex>
      </Col>
    </Row>
  );
});
