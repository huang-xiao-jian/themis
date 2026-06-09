import type { WorkspaceCoordinationEventType } from './WorkspaceCoordinationEventType';

/** Workspace 级协调事件（Group → Workspace，单向） */
export interface WorkspaceCoordinationEvent {
  /** 事件类型 */
  readonly type: WorkspaceCoordinationEventType;
  /** 事件来源 Group 标识 */
  readonly sourceId: string;
}
