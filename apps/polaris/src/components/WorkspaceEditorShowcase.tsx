import { RuleWorkspaceEditor, SisyphusAntdProvider } from '@sisyphus/antd';
import type { AtomicRuleGroup, RuleFactorDefinition } from '@sisyphus/core';
import { createRuleWorkspace, DataType } from '@sisyphus/core';
import { SisyphusProvider } from '@sisyphus/react';
import { Col, Row } from 'antd';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

/** 演示用规则因子定义 */
const DEMO_FACTORS: readonly RuleFactorDefinition[] = [
  { name: 'is_vip', title: '是否VIP', dataType: DataType.BOOLEAN },
  { name: 'username', title: '用户名', dataType: DataType.STRING },
  { name: 'age', title: '年龄', dataType: DataType.NUMBER },
];

/** 多组编辑场景：多个规则组快照 */
const MULTI_GROUP_RULE_GROUPS: readonly AtomicRuleGroup[] = [
  {
    id: 'group-1',
    rules: [{ id: 'rule-1', name: 'is_vip', operator: 'is', threshold: true }],
  },
  {
    id: 'group-2',
    rules: [
      { id: 'rule-2', name: 'username', operator: 'contains', threshold: 'admin' },
      { id: 'rule-3', name: 'age', operator: '<=', threshold: 60 },
    ],
  },
];

/** 空工作空间 */
export function EmptyWorkspaceCase(): ReactElement {
  const workspace = useMemo(() => createRuleWorkspace({ factors: DEMO_FACTORS }), []);

  return (
    <SisyphusProvider scheduler={workspace}>
      <SisyphusAntdProvider>
        <Row gutter={16}>
          <Col lg={12} md={16}>
            <RuleWorkspaceEditor />
          </Col>
          <Col lg={12} md={16}>
            <RuleWorkspaceEditor />
          </Col>
        </Row>
      </SisyphusAntdProvider>
    </SisyphusProvider>
  );
}

/** 多规则组编辑 */
export function MultiGroupsCase(): ReactElement {
  const workspace = useMemo(
    () => createRuleWorkspace({ factors: DEMO_FACTORS, ruleGroups: MULTI_GROUP_RULE_GROUPS }),
    []
  );

  return (
    <SisyphusProvider scheduler={workspace}>
      <SisyphusAntdProvider>
        <Row gutter={16}>
          <Col span={8}>
            <RuleWorkspaceEditor />
          </Col>
          <Col span={8}>
            <RuleWorkspaceEditor />
          </Col>
        </Row>
      </SisyphusAntdProvider>
    </SisyphusProvider>
  );
}
