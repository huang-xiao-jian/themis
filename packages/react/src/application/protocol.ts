import type {
  AtomicRuleGroupScheduler,
  AtomicRuleScheduler,
  RuleWorkspaceScheduler,
} from '@sisyphus/core';
import type React from 'react';

/** AtomicRuleView 组件属性 */
export interface AtomicRuleViewProperties {
  /** 组件类型标识 */
  readonly type: 'AtomicRuleView';
  /** 业务逻辑实体 */
  readonly scheduler: AtomicRuleScheduler;
}

/** AtomicRuleGroupView 组件属性 */
export interface AtomicRuleGroupViewProperties {
  /** 组件类型标识 */
  readonly type: 'AtomicRuleGroupView';
  /** 业务逻辑实体 */
  readonly scheduler: AtomicRuleGroupScheduler;
}

/** RuleWorkspaceView 组件属性 */
export interface RuleWorkspaceViewProperties {
  /** 组件类型标识 */
  readonly type: 'RuleWorkspaceView';
  /** 业务逻辑实体 */
  readonly scheduler: RuleWorkspaceScheduler;
}

/** 编辑器组件属性联合类型 */
export type EditorComponentProperties =
  | AtomicRuleViewProperties
  | AtomicRuleGroupViewProperties
  | RuleWorkspaceViewProperties;

/** 编辑器组件渲染器注册表 */
export interface ComponentRendererRegistry {
  /** 注册 AtomicRuleView 组件 */
  registerAtomicRuleView(component: React.ComponentType<AtomicRuleViewProperties>): void;
  /** 注册 AtomicRuleGroupView 组件 */
  registerAtomicRuleGroupView(component: React.ComponentType<AtomicRuleGroupViewProperties>): void;
  /** 注册 RuleWorkspaceView 组件 */
  registerRuleWorkspaceView(component: React.ComponentType<RuleWorkspaceViewProperties>): void;
}

/** 组件渲染器协议 */
export interface ComponentRenderer {
  /** 渲染编辑器组件 */
  render(props: EditorComponentProperties): React.ReactElement;
}

/** Sisyphus 上下文（插件可访问） */
export interface SisyphusContext {
  /** 组件渲染器注册表 */
  readonly registry: ComponentRendererRegistry;
}

/** 组件渲染器插件 */
export interface SisyphusPlugin {
  /** 插件名称 */
  name: string;
  /** 安装插件 */
  install(context: SisyphusContext): void;
}
