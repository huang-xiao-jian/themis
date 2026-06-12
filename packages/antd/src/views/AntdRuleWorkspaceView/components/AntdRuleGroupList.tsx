import type { RuleWorkspaceScheduler } from '@sisyphus/core';
import { observer } from '@unsignal/react';
import { Flex } from 'antd';
import type { ReactElement } from 'react';
import { AntdRuleGroupListItem } from './AntdRuleGroupListItem';

export interface AntdRuleGroupListProps {
  scheduler: RuleWorkspaceScheduler;
}

/** 规则组列表，独立追踪 groups 信号变化 */
export const AntdRuleGroupList = observer(function AntdRuleGroupList(
  props: AntdRuleGroupListProps
): ReactElement {
  const groups = props.scheduler.groups.value;

  return (
    <Flex vertical gap="medium">
      {groups.map((group) => (
        <AntdRuleGroupListItem key={group.id} group={group} />
      ))}
    </Flex>
  );
});
