import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useSignals } from '@preact/signals-react/runtime';
import type { AtomicRuleGroupViewProperties } from '@sisyphus/react';
import { Button, Card, Space } from 'antd';
import type { ReactElement } from 'react';
import { useCallback } from 'react';
import { AntdAtomicRuleView } from './AntdAtomicRuleView';

/** antd 规则组编辑器视图 */
export function AntdAtomicRuleGroupView({
  scheduler,
}: AtomicRuleGroupViewProperties): ReactElement {
  useSignals();
  const rules = scheduler.rules.value;
  const factorOptions = scheduler.factorOptions.value;

  const handleAddRule = useCallback(() => {
    const ruleId = `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    scheduler.addRule(ruleId);
  }, [scheduler]);

  const handleRemoveRule = useCallback(
    (ruleId: string) => {
      scheduler.removeRule(ruleId);
    },
    [scheduler]
  );

  return (
    <Card
      size="small"
      title="规则组"
      extra={
        <Button type="link" icon={<PlusOutlined />} onClick={handleAddRule}>
          添加规则
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {rules.map((rule) => (
          <Space key={rule.id} align="start" wrap>
            <AntdAtomicRuleView
              type="AtomicRuleView"
              scheduler={rule}
              factorOptions={factorOptions}
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveRule(rule.id)}
            />
          </Space>
        ))}
        {rules.length === 0 && (
          <Button type="dashed" icon={<PlusOutlined />} block onClick={handleAddRule}>
            添加规则
          </Button>
        )}
      </Space>
    </Card>
  );
}
