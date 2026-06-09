import type { ComponentType } from 'react';
import type { RuleWorkspaceViewProperties, ViewRegistry } from './protocol';

/** 编辑器组件注册表默认实现 */
export class DefaultComponentRendererRegistry implements ViewRegistry {
  private ruleWorkspaceViewComponent: ComponentType<RuleWorkspaceViewProperties> | null = null;

  registerRuleWorkspaceView(component: ComponentType<RuleWorkspaceViewProperties>): void {
    this.ruleWorkspaceViewComponent = component;
  }

  getRuleWorkspaceView(): ComponentType<RuleWorkspaceViewProperties> | null {
    return this.ruleWorkspaceViewComponent;
  }
}
