import { describe, expect, it, vi } from 'vitest';
import { TransitionEventType } from '../dsl/TransitionEventType';
import { createTransitionEventEmitter } from './TransitionEventEmitter';

describe('TransitionEventEmitter', () => {
  it('emits events and invokes subscribed handlers', () => {
    const emitter = createTransitionEventEmitter<string>();
    const handler = vi.fn();
    emitter.on(TransitionEventType.OK, handler);
    emitter.emit(TransitionEventType.OK, 'rule-1');
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({
      type: TransitionEventType.OK,
      sourceId: 'rule-1',
    });
  });

  it('supports multiple handlers for the same event type', () => {
    const emitter = createTransitionEventEmitter<string>();
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    emitter.on(TransitionEventType.EDIT, handler1);
    emitter.on(TransitionEventType.EDIT, handler2);
    emitter.emit(TransitionEventType.EDIT, 'rule-2');
    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it('does not invoke handlers for different event types', () => {
    const emitter = createTransitionEventEmitter<string>();
    const handler = vi.fn();
    emitter.on(TransitionEventType.OK, handler);
    emitter.emit(TransitionEventType.CANCEL, 'rule-1');
    expect(handler).not.toHaveBeenCalled();
  });

  it('off() unsubscribes a specific handler', () => {
    const emitter = createTransitionEventEmitter<string>();
    const handler = vi.fn();
    emitter.on(TransitionEventType.OK, handler);
    emitter.off(TransitionEventType.OK, handler);
    emitter.emit(TransitionEventType.OK, 'rule-1');
    expect(handler).not.toHaveBeenCalled();
  });

  it('off() with non-existent handler is a no-op', () => {
    const emitter = createTransitionEventEmitter<string>();
    const handler = vi.fn();
    expect(() => emitter.off(TransitionEventType.OK, handler)).not.toThrow();
  });
});
