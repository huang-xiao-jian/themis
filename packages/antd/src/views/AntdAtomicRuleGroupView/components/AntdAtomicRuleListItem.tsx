import { FormProvider } from '@formily/react';
import type { AtomicRuleScheduler } from '@sisyphus/core';
import { observer } from '@unsignal/react';
import type { ReactElement } from 'react';
import { AntdAtomicRuleView } from '../../AntdAtomicRuleView';

export interface AntdAtomicRuleListItemProps {
  readonly scheduler: AtomicRuleScheduler;
}

/** 规则列表，独立追踪 rules 和 factors 信号变化 */
export const AntdAtomicRuleListItem = observer(function AntdAtomicRuleListItem(
  props: AntdAtomicRuleListItemProps
): ReactElement {
  return (
    <FormProvider form={props.scheduler.form}>
      <AntdAtomicRuleView scheduler={props.scheduler} />
    </FormProvider>
  );
});
