import type { SisyphusContext, SisyphusPlugin } from '@sisyphus/react';
import { AntdAtomicRuleGroupView } from './views/AntdAtomicRuleGroupView';
import { AntdAtomicRuleView } from './views/AntdAtomicRuleView';
import { AntdRuleWorkspaceView } from './views/AntdRuleWorkspaceView';

/** antd 组件渲染器插件 */
export class AntdPlugin implements SisyphusPlugin {
  readonly name = 'antd';

  install(context: SisyphusContext): void {
    context.registry.registerAtomicRuleView(AntdAtomicRuleView);
    context.registry.registerAtomicRuleGroupView(AntdAtomicRuleGroupView);
    context.registry.registerRuleWorkspaceView(AntdRuleWorkspaceView);
  }
}
