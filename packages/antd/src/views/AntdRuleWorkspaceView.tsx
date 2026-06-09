import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useSignals } from '@preact/signals-react/runtime';
import type { RuleWorkspaceScheduler } from '@sisyphus/core';
import type { RuleWorkspaceViewProperties } from '@sisyphus/react';
import { Button, Card, Flex } from 'antd';
import type { ReactElement } from 'react';
import { useCallback } from 'react';
import { AntdAtomicRuleGroupView } from './AntdAtomicRuleGroupView';

/** 规则组列表，独立追踪 groups 信号变化 */
function AntdRuleGroupList({ scheduler }: { scheduler: RuleWorkspaceScheduler }): ReactElement {
  useSignals();
  const groups = scheduler.groups.value;

  return (
    <Flex vertical gap="medium">
      {groups.map((group) => (
        <Card
          key={group.id}
          size="small"
          title="规则组"
          extra={<Button type="text" danger icon={<DeleteOutlined />} onClick={group.onRemove} />}
        >
          <AntdAtomicRuleGroupView type="AtomicRuleGroupView" scheduler={group} />
        </Card>
      ))}
    </Flex>
  );
}

/** 添加规则组按钮 */
function AntdRuleGroupActions({ scheduler }: { scheduler: RuleWorkspaceScheduler }): ReactElement {
  useSignals();
  const canAddGroup = scheduler.canAddGroup.value;

  const onAddGroup = useCallback(() => {
    scheduler.addGroup();
  }, [scheduler]);

  return (
    <Button
      type="dashed"
      icon={<PlusOutlined />}
      block
      disabled={!canAddGroup}
      onClick={onAddGroup}
    >
      添加规则组
    </Button>
  );
}

/** antd 工作空间编辑器视图 */
export function AntdRuleWorkspaceView({ scheduler }: RuleWorkspaceViewProperties): ReactElement {
  return (
    <Flex vertical gap="medium">
      <AntdRuleGroupList scheduler={scheduler} />
      <AntdRuleGroupActions scheduler={scheduler} />
    </Flex>
  );
}
