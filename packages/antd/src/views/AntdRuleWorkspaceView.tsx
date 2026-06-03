import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useSignals } from '@preact/signals-react/runtime';
import type { RuleWorkspaceViewProperties } from '@sisyphus/react';
import { Button, Card, Space } from 'antd';
import type { ReactElement } from 'react';
import { useCallback } from 'react';
import { AntdAtomicRuleGroupView } from './AntdAtomicRuleGroupView';

/** antd 工作空间编辑器视图 */
export function AntdRuleWorkspaceView({ scheduler }: RuleWorkspaceViewProperties): ReactElement {
  useSignals();
  const groups = scheduler.groups.value;

  const onAddGroup = useCallback(() => {
    scheduler.addGroup();
  }, [scheduler]);

  const onRemoveGroup = useCallback(
    (groupId: string) => {
      scheduler.removeGroup(groupId);
    },
    [scheduler]
  );

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {groups.map((group) => (
        <Card
          key={group.id}
          size="small"
          title="规则组"
          extra={
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onRemoveGroup(group.id)}
            />
          }
        >
          <AntdAtomicRuleGroupView type="AtomicRuleGroupView" scheduler={group} />
        </Card>
      ))}
      <Button type="dashed" icon={<PlusOutlined />} block onClick={onAddGroup}>
        添加规则组
      </Button>
    </Space>
  );
}
