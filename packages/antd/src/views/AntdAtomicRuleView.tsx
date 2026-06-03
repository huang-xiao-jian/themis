import { useSignals } from '@preact/signals-react/runtime';
import type { FieldDataSource } from '@sisyphus/core';
import type { AtomicRuleViewProperties } from '@sisyphus/react';
import { Select } from 'antd';
import type { ReactElement } from 'react';
import { useCallback } from 'react';
import { ThresholdRenderer } from '../components/ThresholdRenderer';
import { useSisyphusAntdConfig } from '../config/useSisyphusAntdConfig';

/** AntdAtomicRuleView 扩展属性（包含由父组件传入的 factors） */
interface AntdAtomicRuleViewProps extends AtomicRuleViewProperties {
  /** 可用的规则因子选项（由 AtomicRuleGroupView 传入） */
  readonly factors?: readonly FieldDataSource[];
}

/** antd 原子规则编辑器视图 */
export function AntdAtomicRuleView({
  scheduler,
  factors = [],
}: AntdAtomicRuleViewProps): ReactElement {
  useSignals();
  const config = useSisyphusAntdConfig();

  // 读取 Signal.value，useSignals() 已启用自动追踪
  const operators = scheduler.operators.value;
  const thresholder = scheduler.thresholder.value;
  const nameValue = scheduler.name.value;
  const operatorValue = scheduler.operator.value;
  const thresholdValue = scheduler.threshold.value;

  const handleNameChange = useCallback(
    (value: string) => {
      scheduler.onFieldChange({ field: 'name', value });
    },
    [scheduler]
  );

  const handleOperatorChange = useCallback(
    (value: string) => {
      scheduler.onFieldChange({ field: 'operator', value });
    },
    [scheduler]
  );

  const handleThresholdChange = useCallback(
    (value: unknown) => {
      scheduler.onFieldChange({ field: 'threshold', value });
    },
    [scheduler]
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
      <Select
        value={nameValue ?? undefined}
        options={[...factors]}
        onChange={handleNameChange}
        placeholder={`${config.placeholderTemplate.select}规则因子`}
        allowClear
        size={config.size}
        style={{ minWidth: 140 }}
        showSearch
        filterOption={(input, option) =>
          (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false
        }
      />
      <Select
        value={operatorValue ?? undefined}
        options={[...operators]}
        onChange={handleOperatorChange}
        placeholder={`${config.placeholderTemplate.select}操作符`}
        allowClear
        size={config.size}
        style={{ minWidth: 120 }}
      />
      {thresholder && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <ThresholdRenderer
            properties={thresholder}
            value={thresholdValue}
            onChange={handleThresholdChange}
          />
        </div>
      )}
    </div>
  );
}
