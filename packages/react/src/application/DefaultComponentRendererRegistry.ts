import type React from 'react';
import type {
  AtomicRuleGroupViewProperties,
  AtomicRuleViewProperties,
  ComponentRendererRegistry,
  RuleWorkspaceViewProperties,
} from './protocol';

/** 编辑器组件注册表默认实现 */
export class DefaultComponentRendererRegistry implements ComponentRendererRegistry {
  private atomicRuleViewComponent: React.ComponentType<AtomicRuleViewProperties> | null = null;
  private atomicRuleGroupViewComponent: React.ComponentType<AtomicRuleGroupViewProperties> | null =
    null;
  private ruleWorkspaceViewComponent: React.ComponentType<RuleWorkspaceViewProperties> | null =
    null;

  registerAtomicRuleView(component: React.ComponentType<AtomicRuleViewProperties>): void {
    this.atomicRuleViewComponent = component;
  }

  registerAtomicRuleGroupView(component: React.ComponentType<AtomicRuleGroupViewProperties>): void {
    this.atomicRuleGroupViewComponent = component;
  }

  registerRuleWorkspaceView(component: React.ComponentType<RuleWorkspaceViewProperties>): void {
    this.ruleWorkspaceViewComponent = component;
  }

  getAtomicRuleView(): React.ComponentType<AtomicRuleViewProperties> | null {
    return this.atomicRuleViewComponent;
  }

  getAtomicRuleGroupView(): React.ComponentType<AtomicRuleGroupViewProperties> | null {
    return this.atomicRuleGroupViewComponent;
  }

  getRuleWorkspaceView(): React.ComponentType<RuleWorkspaceViewProperties> | null {
    return this.ruleWorkspaceViewComponent;
  }
}
