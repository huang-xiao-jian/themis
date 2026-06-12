import { DeleteOutlined } from '@ant-design/icons';
import type { AtomicRuleGroupScheduler } from '@sisyphus/core';
import { observer } from '@unsignal/react';
import { Button, Card } from 'antd';
import type { ReactElement } from 'react';
import { AntdAtomicRuleGroupView } from '../../AntdAtomicRuleGroupView';

export interface AntdRuleGroupListItemProps {
  group: AtomicRuleGroupScheduler;
}

export const AntdRuleGroupListItem = observer(function AntdRuleGroupListItem(
  props: AntdRuleGroupListItemProps
): ReactElement {
  const scheduler = props.group;

  return (
    <Card
      size="small"
      title="规则组"
      extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={scheduler.onRemove} />}
    >
      <AntdAtomicRuleGroupView scheduler={scheduler} />
    </Card>
  );
});
