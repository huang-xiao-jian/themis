import type { RuleWorkspaceScheduler } from '@sisyphus/core';
import type { ReactElement } from 'react';
import { RuleWorkspaceView } from '../application/RuleWorkspaceView';

/** WorkspaceEditor 属性 */
export interface WorkspaceEditorProps {
  /** 工作空间实例 */
  workspace: RuleWorkspaceScheduler;
}

/** 业务方入口组件 */
export function WorkspaceEditor({ workspace }: WorkspaceEditorProps): ReactElement {
  return <RuleWorkspaceView type="RuleWorkspaceView" scheduler={workspace} />;
}
