import { PlusOutlined } from '@ant-design/icons';
import type { AtomicRuleGroupScheduler } from '@sisyphus/core';
import { observer } from '@unsignal/react';
import { Button } from 'antd';
import type { ReactElement } from 'react';
import { useCallback } from 'react';

export interface AntdAtomicRuleActionsProps {
  readonly scheduler: AtomicRuleGroupScheduler;
}

/** 添加规则按钮，独立追踪 canAddRule 信号 */
export const AntdAtomicRuleActions = observer(function AntdAtomicRuleActions(
  props: AntdAtomicRuleActionsProps
): ReactElement {
  const canAddRule = props.scheduler.canAddRule.value;

  const onAddRule = useCallback(() => {
    props.scheduler.addRule();
  }, [props.scheduler]);

  return (
    <Button type="dashed" icon={<PlusOutlined />} block disabled={!canAddRule} onClick={onAddRule}>
      添加规则
    </Button>
  );
});
