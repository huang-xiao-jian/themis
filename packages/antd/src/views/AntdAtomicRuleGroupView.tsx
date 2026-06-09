import { PlusOutlined } from '@ant-design/icons';
import { FormProvider } from '@formily/react';
import { useSignals } from '@preact/signals-react/runtime';
import type { AtomicRuleGroupScheduler } from '@sisyphus/core';
import type { AtomicRuleGroupViewProperties } from '@sisyphus/react';
import { Button, Flex } from 'antd';
import type { ReactElement } from 'react';
import { useCallback } from 'react';
import { AntdAtomicRuleView } from './AntdAtomicRuleView';

/** 规则列表，独立追踪 rules 和 factors 信号变化 */
function AntdAtomicRules({ scheduler }: { scheduler: AtomicRuleGroupScheduler }): ReactElement {
  useSignals();
  const rules = scheduler.rules.value;

  return (
    <Flex vertical gap="medium">
      {rules.map((rule) => (
        <FormProvider key={rule.id} form={rule.form}>
          <AntdAtomicRuleView key={rule.id} type="AtomicRuleView" scheduler={rule} />
        </FormProvider>
      ))}
    </Flex>
  );
}

/** 添加规则按钮，独立追踪 canAddRule 信号 */
function AntdAtomicRuleActions({
  scheduler,
}: {
  scheduler: AtomicRuleGroupScheduler;
}): ReactElement {
  useSignals();
  const canAddRule = scheduler.canAddRule.value;

  const onAddRule = useCallback(() => {
    scheduler.addRule();
  }, [scheduler]);

  return (
    <Button type="dashed" icon={<PlusOutlined />} block disabled={!canAddRule} onClick={onAddRule}>
      添加规则
    </Button>
  );
}

/** 规则组状态转换按钮，独立追踪 editable 信号 */
function AntdAtomicRuleGroupActions({
  scheduler,
}: {
  scheduler: AtomicRuleGroupScheduler;
}): ReactElement {
  useSignals();
  const editable = scheduler.editable.value;

  return (
    <Flex gap="small">
      {editable ? (
        <>
          <Button type="primary" size="small" onClick={scheduler.onOk}>
            确认
          </Button>
          <Button size="small" onClick={scheduler.onCancel}>
            取消
          </Button>
        </>
      ) : (
        <Button size="small" onClick={scheduler.onEdit}>
          编辑
        </Button>
      )}
    </Flex>
  );
}

/** antd 规则组编辑器视图 */
export function AntdAtomicRuleGroupView({
  scheduler,
}: AtomicRuleGroupViewProperties): ReactElement {
  return (
    <Flex vertical gap="medium">
      <AntdAtomicRules scheduler={scheduler} />
      <AntdAtomicRuleActions scheduler={scheduler} />
      <AntdAtomicRuleGroupActions scheduler={scheduler} />
    </Flex>
  );
}
