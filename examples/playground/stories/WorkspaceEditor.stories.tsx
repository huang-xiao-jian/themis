import { createAntdPlugin } from '@sisyphus/antd';
import type { RuleFactorDefinition } from '@sisyphus/core';
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

/** Story 装饰器：构建 scope + workspace，注入 Provider */
function StoryWrapper(): ReactElement {
  const scope = useMemo(() => createSisyphusScope({ plugins: [createAntdPlugin()] }), []);
  const workspace = useMemo(() => createRuleWorkspace({ factors: DEMO_FACTORS }), []);

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

const meta: Meta<typeof StoryWrapper> = {
  title: 'WorkspaceEditor',
  component: StoryWrapper,
};

export default meta;

type Story = StoryObj<typeof StoryWrapper>;

/** 默认空工作空间 */
export const Default: Story = {};
