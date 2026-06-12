import type { AtomicRuleGroupScheduler } from '@sisyphus/core';
import { observer } from '@unsignal/react';
import { Flex } from 'antd';
import type { ReactElement } from 'react';
import { AntdAtomicRuleListItem } from './AntdAtomicRuleListItem';

export interface AntdAtomicRuleListProps {
  readonly scheduler: AtomicRuleGroupScheduler;
}

/** 规则列表，独立追踪 rules 和 factors 信号变化 */
export const AntdAtomicRuleList = observer(function AntdAtomicRuleList(
  props: AntdAtomicRuleListProps
): ReactElement {
  const rules = props.scheduler.rules.value;

  return (
    <Flex vertical gap="medium">
      {rules.map((rule) => (
        <AntdAtomicRuleListItem key={rule.id} scheduler={rule} />
      ))}
    </Flex>
  );
});
