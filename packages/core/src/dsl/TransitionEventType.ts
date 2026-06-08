/**
 * 状态迁移事件类型
 *
 * - OK：用户确认配置（onOk）
 * - EDIT：用户请求进入编辑态（onEdit）
 * - CANCEL：用户取消编辑（onCancel，仅 Rule 级别）
 */
export enum TransitionEventType {
  OK = 'ok',
  EDIT = 'edit',
  CANCEL = 'cancel',
}
