import { PlusOutlined } from '@ant-design/icons';
import type { RuleWorkspaceScheduler } from '@sisyphus/core';
import { observer } from '@unsignal/react';
import { Button } from 'antd';
import type { ReactElement } from 'react';
import { useCallback } from 'react';

export interface AntdRuleGroupActionsProps {
  scheduler: RuleWorkspaceScheduler;
}

/** 添加规则组按钮 */
export const AntdRuleGroupActions = observer(function AntdRuleGroupActions(
  props: AntdRuleGroupActionsProps
): ReactElement {
  const canAddGroup = props.scheduler.canAddGroup.value;

  const onAddGroup = useCallback(() => {
    props.scheduler.addGroup();
  }, [props.scheduler]);

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
});
