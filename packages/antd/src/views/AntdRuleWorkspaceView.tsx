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

  const handleAddGroup = useCallback(() => {
    const groupId = `group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    scheduler.addGroup(groupId);
  }, [scheduler]);

  const handleRemoveGroup = useCallback(
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
          extra={
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveGroup(group.id)}
            />
          }
        >
          <AntdAtomicRuleGroupView type="AtomicRuleGroupView" scheduler={group} />
        </Card>
      ))}
      <Button type="dashed" icon={<PlusOutlined />} block onClick={handleAddGroup}>
        添加规则组
      </Button>
    </Space>
  );
}
