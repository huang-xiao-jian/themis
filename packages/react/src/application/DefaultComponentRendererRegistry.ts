import type { ComponentType } from 'react';
import type {
  AtomicRuleGroupViewProperties,
  AtomicRuleViewProperties,
  ComponentRendererRegistry,
  RuleWorkspaceViewProperties,
} from './protocol';

/** 编辑器组件注册表默认实现 */
export class DefaultComponentRendererRegistry implements ComponentRendererRegistry {
  private atomicRuleViewComponent: ComponentType<AtomicRuleViewProperties> | null = null;
  private atomicRuleGroupViewComponent: ComponentType<AtomicRuleGroupViewProperties> | null = null;
  private ruleWorkspaceViewComponent: ComponentType<RuleWorkspaceViewProperties> | null = null;

  registerAtomicRuleView(component: ComponentType<AtomicRuleViewProperties>): void {
    this.atomicRuleViewComponent = component;
  }

  registerAtomicRuleGroupView(component: ComponentType<AtomicRuleGroupViewProperties>): void {
    this.atomicRuleGroupViewComponent = component;
  }

  registerRuleWorkspaceView(component: ComponentType<RuleWorkspaceViewProperties>): void {
    this.ruleWorkspaceViewComponent = component;
  }

  getAtomicRuleView(): ComponentType<AtomicRuleViewProperties> | null {
    return this.atomicRuleViewComponent;
  }

  getAtomicRuleGroupView(): ComponentType<AtomicRuleGroupViewProperties> | null {
    return this.atomicRuleGroupViewComponent;
  }

  getRuleWorkspaceView(): ComponentType<RuleWorkspaceViewProperties> | null {
    return this.ruleWorkspaceViewComponent;
  }
}
