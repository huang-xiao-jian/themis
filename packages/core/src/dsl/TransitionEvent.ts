import type { TransitionEventType } from './TransitionEventType';

/**
 * 状态迁移事件
 *
 * 事件流向：子级 → 父级（单向）
 */
export interface TransitionEvent<TId = string> {
  /** 事件类型 */
  readonly type: TransitionEventType;
  /** 事件来源子级标识 */
  readonly sourceId: TId;
}
