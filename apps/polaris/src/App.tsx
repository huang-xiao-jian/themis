import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider as AntdConfigProvider, Flex, Tabs, Typography } from 'antd';
import { type ReactElement } from 'react';
import { FactorShowcasePanel } from './components/FactorShowcasePanel.tsx';
import { WorkspaceEditorPanel } from './components/WorkspaceEditorPanel.tsx';

function App(): ReactElement {
  return (
    <StyleProvider layer>
      <AntdConfigProvider>
        <Flex vertical gap="small" className="px-4 py-8">
          <Typography.Title level={2}>案例展示</Typography.Title>
          <Tabs
            defaultActiveKey="factor-showcase"
            items={[
              {
                key: 'factor-showcase',
                label: 'FactorShowcase',
                children: <FactorShowcasePanel />,
              },
              {
                key: 'workspace-editor',
                label: 'WorkspaceEditor',
                children: <WorkspaceEditorPanel />,
              },
            ]}
          />
        </Flex>
      </AntdConfigProvider>
    </StyleProvider>
  );
}

export default App;
