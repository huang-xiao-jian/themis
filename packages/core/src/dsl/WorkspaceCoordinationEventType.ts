/**
 * Workspace 级协调事件类型（Group → Workspace）
 *
 * - OK：用户确认配置（onOk）
 * - EDIT：用户请求进入编辑态（onEdit）
 * - CANCEL：用户取消编辑（onCancel）
 * - REMOVE：用户请求移除自身（onRemove）
 */
export enum WorkspaceCoordinationEventType {
  OK = 'ok',
  EDIT = 'edit',
  CANCEL = 'cancel',
  REMOVE = 'remove',
}
