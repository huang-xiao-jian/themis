import { createNanoEvents } from 'nanoevents';
import type { TransitionEvent } from '../dsl/TransitionEvent';
import { TransitionEventType } from '../dsl/TransitionEventType';

/**
 * 状态迁移事件发射器
 *
 * 职责：
 * - 提供事件订阅 / 取消订阅能力
 * - Scheduler 内部持有实例，onOk / onEdit / onCancel 触发 emit()
 * - 父级在创建子级时自动 on() 订阅，在销毁 / 移除子级时自动 off() 取消订阅
 */
export interface TransitionEventEmitter<TId = string> {
  /** 订阅指定类型的事件 */
  on(event: TransitionEventType, handler: (e: TransitionEvent<TId>) => void): void;
  /** 取消订阅 */
  off(event: TransitionEventType, handler: (e: TransitionEvent<TId>) => void): void;
  /** 发射事件 */
  emit(event: TransitionEventType, sourceId: TId): void;
}

/** nanoevents 事件映射 */
interface TransitionEvents<TId = string> {
  [TransitionEventType.OK]: (e: TransitionEvent<TId>) => void;
  [TransitionEventType.EDIT]: (e: TransitionEvent<TId>) => void;
  [TransitionEventType.CANCEL]: (e: TransitionEvent<TId>) => void;
}

/**
 * 创建 TransitionEventEmitter 实例
 *
 * 基于 nanoevents 实现轻量级事件订阅
 */
export function createTransitionEventEmitter<TId = string>(): TransitionEventEmitter<TId> {
  const emitter = createNanoEvents<TransitionEvents<TId>>();
  const unbindMap = new Map<
    TransitionEventType,
    Map<(e: TransitionEvent<TId>) => void, () => void>
  >();

  return {
    on(event: TransitionEventType, handler: (e: TransitionEvent<TId>) => void): void {
      const unbind = emitter.on(event, handler);
      let handlerMap = unbindMap.get(event);
      if (!handlerMap) {
        handlerMap = new Map();
        unbindMap.set(event, handlerMap);
      }
      handlerMap.set(handler, unbind);
    },

    off(event: TransitionEventType, handler: (e: TransitionEvent<TId>) => void): void {
      const handlerMap = unbindMap.get(event);
      const unbind = handlerMap?.get(handler);
      if (unbind) {
        unbind();
        handlerMap!.delete(handler);
      }
    },

    emit(event: TransitionEventType, sourceId: TId): void {
      emitter.emit(event, { type: event, sourceId });
    },
  };
}
