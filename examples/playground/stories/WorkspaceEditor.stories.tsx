import { createAntdPlugin } from '@sisyphus/antd';
import type { AtomicRuleGroup, RuleFactorDefinition } from '@sisyphus/core';
import { createRuleWorkspace, DataType } from '@sisyphus/core';
import { createSisyphusScope, SisyphusScopeProvider, WorkspaceEditor } from '@sisyphus/react';
import type { Meta, StoryObj } from '@storybook/react';
import { Col, Row } from 'antd';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

/** 演示用规则因子定义 */
const DEMO_FACTORS: readonly RuleFactorDefinition[] = [
  { name: 'is_vip', title: '是否VIP', dataType: DataType.BOOLEAN },
  { name: 'username', title: '用户名', dataType: DataType.STRING },
  { name: 'age', title: '年龄', dataType: DataType.NUMBER },
];

/** 编辑场景：预填充的规则组快照 */
const EDIT_RULE_GROUPS: readonly AtomicRuleGroup[] = [
  {
    rules: [
      { id: 'rule-1', name: 'is_vip', operator: 'is', threshold: true },
      { id: 'rule-2', name: 'age', operator: '>=', threshold: 18 },
    ],
  },
];

/** 多组编辑场景：多个规则组快照 */
const MULTI_GROUP_RULE_GROUPS: readonly AtomicRuleGroup[] = [
  {
    rules: [{ id: 'rule-1', name: 'is_vip', operator: 'is', threshold: true }],
  },
  {
    rules: [
      { id: 'rule-2', name: 'username', operator: 'contains', threshold: 'admin' },
      { id: 'rule-3', name: 'age', operator: '<=', threshold: 60 },
    ],
  },
];

/** Story 装饰器：空工作空间 */
function EmptyWrapper(): ReactElement {
  const scope = useMemo(() => createSisyphusScope({ plugins: [createAntdPlugin()] }), []);
  const workspace = useMemo(() => createRuleWorkspace({ factors: DEMO_FACTORS }), []);

  return (
    <SisyphusScopeProvider scope={scope}>
      <Row gutter={16}>
        <Col lg={12} md={16}>
          <WorkspaceEditor workspace={workspace} />
        </Col>
        <Col lg={12} md={16}>
          <WorkspaceEditor workspace={workspace} />
        </Col>
      </Row>
    </SisyphusScopeProvider>
  );
}

/** Story 装饰器：编辑已有规则 */
function EditWrapper(): ReactElement {
  const scope = useMemo(() => createSisyphusScope({ plugins: [createAntdPlugin()] }), []);
  const workspace = useMemo(
    () => createRuleWorkspace({ factors: DEMO_FACTORS, ruleGroups: EDIT_RULE_GROUPS }),
    []
  );

  return (
    <SisyphusScopeProvider scope={scope}>
      <Row gutter={16}>
        <Col lg={12} md={16}>
          <WorkspaceEditor workspace={workspace} />
        </Col>
        <Col lg={12} md={16}>
          <WorkspaceEditor workspace={workspace} />
        </Col>
      </Row>
    </SisyphusScopeProvider>
  );
}

/** Story 装饰器：多规则组编辑 */
function MultiGroupEditWrapper(): ReactElement {
  const scope = useMemo(() => createSisyphusScope({ plugins: [createAntdPlugin()] }), []);
  const workspace = useMemo(
    () => createRuleWorkspace({ factors: DEMO_FACTORS, ruleGroups: MULTI_GROUP_RULE_GROUPS }),
    []
  );

  return (
    <SisyphusScopeProvider scope={scope}>
      <Row gutter={16}>
        <Col span={8}>
          <WorkspaceEditor workspace={workspace} />
        </Col>
        <Col span={8}>
          <WorkspaceEditor workspace={workspace} />
        </Col>
      </Row>
    </SisyphusScopeProvider>
  );
}

const meta: Meta<typeof EmptyWrapper> = {
  title: 'WorkspaceEditor',
  component: EmptyWrapper,
};

export default meta;

type Story = StoryObj<typeof EmptyWrapper>;

/** 默认空工作空间 */
export const Default: Story = {
  render: () => <EmptyWrapper />,
};

/** 编辑场景：预填充单组规则 */
export const EditSingleGroup: Story = {
  render: () => <EditWrapper />,
};

/** 编辑场景：预填充多组规则 */
export const EditMultiGroups: Story = {
  render: () => <MultiGroupEditWrapper />,
};
