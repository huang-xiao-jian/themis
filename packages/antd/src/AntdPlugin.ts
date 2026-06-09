import type { SisyphusContext, SisyphusPlugin } from '@sisyphus/react';
import { AntdRuleWorkspaceView } from './views/AntdRuleWorkspaceView';

/** antd 组件渲染器插件 */
export class AntdPlugin implements SisyphusPlugin {
  readonly name = 'antd';

  onRegister(context: SisyphusContext): void {
    context.registry.registerRuleWorkspaceView(AntdRuleWorkspaceView);
  }
}
