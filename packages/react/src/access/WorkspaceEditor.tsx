import type { RuleWorkspaceScheduler } from '@sisyphus/core';
import type React from 'react';
import { RuleWorkspaceView } from '../application/RuleWorkspaceView';

/** WorkspaceEditor 属性 */
export interface WorkspaceEditorProps {
  /** 工作空间实例 */
  workspace: RuleWorkspaceScheduler;
}

/** 业务方入口组件 */
export function WorkspaceEditor({ workspace }: WorkspaceEditorProps): React.ReactElement {
  return <RuleWorkspaceView type="RuleWorkspaceView" scheduler={workspace} />;
}
