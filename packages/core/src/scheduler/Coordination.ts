import { signal, type Signal } from '@preact/signals-core';
import { createNanoEvents, type Emitter, type EventsMap } from 'nanoevents';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import type { TransitionEvent } from '../dsl/TransitionEvent';
import { TransitionEventType } from '../dsl/TransitionEventType';

/**
 * 事件总线（基于 nanoevents Emitter）
 *
 * 概念性命名，对应规格文档中的 EventBus
 */
export type EventBus<Events extends EventsMap> = Emitter<Events>;

/** Workspace 级事件映射（Group → Workspace，OK | EDIT） */
interface WorkspaceTransitionEvents {
  [TransitionEventType.OK]: (e: TransitionEvent) => void;
  [TransitionEventType.EDIT]: (e: TransitionEvent) => void;
}

/** Group 级事件映射（Rule → Group，OK | EDIT | CANCEL） */
interface GroupTransitionEvents {
  [TransitionEventType.OK]: (e: TransitionEvent) => void;
  [TransitionEventType.EDIT]: (e: TransitionEvent) => void;
  [TransitionEventType.CANCEL]: (e: TransitionEvent) => void;
}

/**
 * Workspace 级协调实体（Workspace → Group 协议）
 *
 * 事件总线（上行）：Group → Workspace，有效事件类型 OK | EDIT
 * 信号通道（下行）：Workspace → Group
 * - 子级 AtomicRuleGroupScheduler 通过 computed 从 editingGroupId 派生 state
 * - 子级通过 allFactors 共享规则因子定义
 */
export interface WorkspaceCoordination {
  // ── 事件总线（上行：Group → Workspace）────────────
  /** 事件总线，有效事件类型：OK | EDIT */
  readonly bus: EventBus<WorkspaceTransitionEvents>;

  // ── 信号通道（下行：Workspace → Group）────────────
  /** 当前处于编辑态的 Group ID（null 表示无编辑中的 Group） */
  readonly editingGroupId: Signal<string | null>;
  /** 可用规则因子定义列表（Workspace 级共享） */
  readonly allFactors: Signal<readonly RuleFactorDefinition[]>;
}

/**
 * Group 级协调实体（Group → Rule 协议）
 *
 * 事件总线（上行）：Rule → Group，有效事件类型 OK | EDIT | CANCEL
 * 信号通道（下行）：Group → Rule
 * - 子级 AtomicRuleScheduler 通过 computed 从 editingRuleId 派生 state
 */
export interface GroupCoordination {
  // ── 事件总线（上行：Rule → Group）────────────
  /** 事件总线，有效事件类型：OK | EDIT | CANCEL */
  readonly bus: EventBus<GroupTransitionEvents>;

  // ── 信号通道（下行：Group → Rule）────────────
  /** 当前处于编辑态的 Rule ID（null 表示无编辑中的 Rule） */
  readonly editingRuleId: Signal<string | null>;
}

/**
 * 创建 WorkspaceCoordination 实例
 *
 * 由 RuleWorkspaceScheduler 持有，供 AtomicRuleGroupScheduler 消费
 */
export function createWorkspaceCoordination(
  factors: readonly RuleFactorDefinition[]
): WorkspaceCoordination {
  return {
    bus: createNanoEvents<WorkspaceTransitionEvents>(),
    editingGroupId: signal<string | null>(null),
    allFactors: signal<readonly RuleFactorDefinition[]>([...factors]),
  };
}

/**
 * 创建 GroupCoordination 实例
 *
 * 由 AtomicRuleGroupScheduler 持有，供 AtomicRuleScheduler 消费
 */
export function createGroupCoordination(): GroupCoordination {
  return {
    bus: createNanoEvents<GroupTransitionEvents>(),
    editingRuleId: signal<string | null>(null),
  };
}
