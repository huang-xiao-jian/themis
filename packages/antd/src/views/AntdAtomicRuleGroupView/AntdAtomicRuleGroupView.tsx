import type { AtomicRuleGroupScheduler } from '@sisyphus/core';
import { observer } from '@unsignal/react';
import { Flex } from 'antd';
import type { ReactElement } from 'react';
import { AntdAtomicRuleActions } from './components/AntdAtomicRuleActions';
import { AntdAtomicRuleList } from './components/AntdAtomicRuleList';

export interface AntdAtomicRuleGroupViewProps {
  readonly scheduler: AtomicRuleGroupScheduler;
}

/** antd 规则组编辑器视图 */
export const AntdAtomicRuleGroupView = observer(function AntdAtomicRuleGroupView(
  props: AntdAtomicRuleGroupViewProps
): ReactElement {
  return (
    <Flex vertical gap="medium">
      <AntdAtomicRuleList scheduler={props.scheduler} />
      <AntdAtomicRuleActions scheduler={props.scheduler} />
    </Flex>
  );
});
