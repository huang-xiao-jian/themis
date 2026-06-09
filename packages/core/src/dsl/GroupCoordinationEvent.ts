import type { GroupCoordinationEventType } from './GroupCoordinationEventType';

/** Group 级协调事件（Rule → Group，单向） */
export interface GroupCoordinationEvent {
  /** 事件类型 */
  readonly type: GroupCoordinationEventType;
  /** 事件来源 Rule 标识 */
  readonly sourceId: string;
}
