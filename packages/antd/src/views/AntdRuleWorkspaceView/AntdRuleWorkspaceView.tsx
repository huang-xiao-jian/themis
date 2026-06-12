import type { RuleWorkspaceViewProperties } from '@sisyphus/react';
import { observer } from '@unsignal/react';
import { Flex } from 'antd';
import type { ReactElement } from 'react';
import { AntdRuleGroupActions } from './components/AntdRuleGroupActions';
import { AntdRuleGroupList } from './components/AntdRuleGroupList';

/** antd 工作空间编辑器视图 */
export const AntdRuleWorkspaceView = observer(function AntdRuleWorkspaceView(
  props: RuleWorkspaceViewProperties
): ReactElement {
  return (
    <Flex vertical gap="medium">
      <AntdRuleGroupList scheduler={props.scheduler} />
      <AntdRuleGroupActions scheduler={props.scheduler} />
    </Flex>
  );
});
