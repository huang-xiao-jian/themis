import { createAntdPlugin } from '@sisyphus/antd';
import type { RuleFactorDefinition } from '@sisyphus/core';
import { ResourceFactory, RuleWorkspaceScheduler, ThresholderInferrer } from '@sisyphus/core';
import { createSisyphusScope, SisyphusScopeProvider, WorkspaceEditor } from '@sisyphus/react';
import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

/**
 * 空 ResourceFactory 桩 —— 仅处理无 resource 声明的因子
 */
class StubResourceFactory extends ResourceFactory {
  override create(): null {
    return null;
  }
}

/** 演示用规则因子定义 */
const DEMO_FACTORS: readonly RuleFactorDefinition[] = [
  { name: 'is_vip', title: '是否VIP' },
  { name: 'username', title: '用户名' },
  { name: 'age', title: '年龄' },
];

/** Story 装饰器：构建 scope + workspace，注入 Provider */
function StoryWrapper(): ReactElement {
  const scope = useMemo(() => createSisyphusScope({ plugins: [createAntdPlugin()] }), []);

  const workspace = useMemo(() => {
    const inferrer = new ThresholderInferrer(new StubResourceFactory());
    return new RuleWorkspaceScheduler(DEMO_FACTORS, inferrer);
  }, []);

  return (
    <SisyphusScopeProvider scope={scope}>
      <WorkspaceEditor workspace={workspace} />
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
