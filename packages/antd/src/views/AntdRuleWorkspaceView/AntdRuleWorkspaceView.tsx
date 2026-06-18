import { useSisyphusScheduler } from '@sisyphus/react';
import { observer } from '@unsignal/react';
import { Flex } from 'antd';
import type { ReactElement } from 'react';
import { AntdRuleGroupActions } from './components/AntdRuleGroupActions';
import { AntdRuleGroupList } from './components/AntdRuleGroupList';

/** antd 工作空间编辑器视图 */
export const RuleWorkspaceEditor = observer(function RuleWorkspaceEditor(): ReactElement {
  const scheduler = useSisyphusScheduler();

  return (
    <Flex vertical gap="medium">
      <AntdRuleGroupList scheduler={scheduler} />
      <AntdRuleGroupActions scheduler={scheduler} />
    </Flex>
  );
});
