import type { RuleWorkspaceScheduler } from '@sisyphus/core';
import type { ComponentType, ReactElement } from 'react';

/** RuleWorkspaceView 组件属性 */
export interface RuleWorkspaceViewProperties {
  /** 业务逻辑实体 */
  readonly scheduler: RuleWorkspaceScheduler;
}

/** 编辑器组件渲染器注册表 */
export interface ViewRegistry {
  /** 注册 RuleWorkspaceView 组件 */
  registerRuleWorkspaceView(component: ComponentType<RuleWorkspaceViewProperties>): void;
}

/** 组件渲染器协议 */
export interface ViewRenderer {
  /** 渲染工作空间编辑组件 */
  renderRuleWorkspaceView(props: RuleWorkspaceViewProperties): ReactElement;
}

/** Sisyphus 上下文（插件可访问） */
export interface SisyphusContext {
  /** 组件渲染器注册表 */
  readonly registry: ViewRegistry;
}

/** 组件渲染器插件 */
export interface SisyphusPlugin {
  /** 插件名称 */
  readonly name: string;
  /** 注册插件 */
  onRegister(context: SisyphusContext): void;
}
