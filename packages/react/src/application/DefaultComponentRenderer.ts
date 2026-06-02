import { createElement, type ReactElement } from 'react';
import { DefaultComponentRendererRegistry } from './DefaultComponentRendererRegistry';
import type { ComponentRenderer, EditorComponentProperties } from './protocol';

/** 组件渲染器默认实现 */
export class DefaultComponentRenderer implements ComponentRenderer {
  private readonly registry: DefaultComponentRendererRegistry;

  constructor(registry: DefaultComponentRendererRegistry) {
    this.registry = registry;
  }

  render(props: EditorComponentProperties): ReactElement {
    switch (props.type) {
      case 'AtomicRuleView': {
        const Component = this.registry.getAtomicRuleView();
        if (!Component) {
          throw new Error(
            '[sisyphus] AtomicRuleView component is not registered. Did you forget to call registerAtomicRuleView()?'
          );
        }
        return createElement(Component, props);
      }
      case 'AtomicRuleGroupView': {
        const Component = this.registry.getAtomicRuleGroupView();
        if (!Component) {
          throw new Error(
            '[sisyphus] AtomicRuleGroupView component is not registered. Did you forget to call registerAtomicRuleGroupView()?'
          );
        }
        return createElement(Component, props);
      }
      case 'RuleWorkspaceView': {
        const Component = this.registry.getRuleWorkspaceView();
        if (!Component) {
          throw new Error(
            '[sisyphus] RuleWorkspaceView component is not registered. Did you forget to call registerRuleWorkspaceView()?'
          );
        }
        return createElement(Component, props);
      }
      default: {
        const exhaustiveCheck: never = props;
        throw new Error(`[sisyphus] Unknown editor component type: ${exhaustiveCheck}`);
      }
    }
  }
}
