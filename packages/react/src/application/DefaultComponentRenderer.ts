import { createElement, type ReactElement } from 'react';
import { DefaultComponentRendererRegistry } from './DefaultComponentRendererRegistry';
import type { RuleWorkspaceViewProperties, ViewRenderer } from './protocol';

/** 组件渲染器默认实现 */
export class DefaultComponentRenderer implements ViewRenderer {
  private readonly registry: DefaultComponentRendererRegistry;

  constructor(registry: DefaultComponentRendererRegistry) {
    this.registry = registry;
  }

  renderRuleWorkspaceView(props: RuleWorkspaceViewProperties): ReactElement {
    const Component = this.registry.getRuleWorkspaceView();
    if (!Component) {
      throw new Error(
        '[sisyphus] RuleWorkspaceView component is not registered. Did you forget to call registerRuleWorkspaceView()?'
      );
    }
    return createElement(Component, props);
  }
}
