import { signal, type ReadonlySignal, type Signal } from '@preact/signals-core';
import { createNanoEvents, type Emitter, type EventsMap } from 'nanoevents';
import type { FieldDataSource } from '../dsl/FieldDataSource';
import type { GroupCoordinationEvent } from '../dsl/GroupCoordinationEvent';
import { GroupCoordinationEventType } from '../dsl/GroupCoordinationEventType';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import type { WorkspaceCoordinationEvent } from '../dsl/WorkspaceCoordinationEvent';
import { WorkspaceCoordinationEventType } from '../dsl/WorkspaceCoordinationEventType';

/**
 * 事件总线（基于 nanoevents Emitter）
 *
 * 概念性命名，对应规格文档中的 EventBus
 */
export type EventBus<Events extends EventsMap> = Emitter<Events>;

/** Workspace 级事件映射（Group → Workspace，REMOVE） */
interface WorkspaceCoordinationEvents {
  [WorkspaceCoordinationEventType.REMOVE]: (e: WorkspaceCoordinationEvent) => void;
}

/** Group 级事件映射（Rule → Group，OK | EDIT | CANCEL | REMOVE） */
interface GroupCoordinationEvents {
  [GroupCoordinationEventType.OK]: (e: GroupCoordinationEvent) => void;
  [GroupCoordinationEventType.EDIT]: (e: GroupCoordinationEvent) => void;
  [GroupCoordinationEventType.CANCEL]: (e: GroupCoordinationEvent) => void;
  [GroupCoordinationEventType.REMOVE]: (e: GroupCoordinationEvent) => void;
}

/**
 * Workspace 级协调实体（Workspace → Group 协议）
 *
 * 事件总线（上行）：Group → Workspace，有效事件类型 REMOVE
 * 信号通道（下行）：Workspace → Group
 * - 子级通过 allFactors 共享规则因子定义
 */
export interface WorkspaceCoordination {
  // ── 事件总线（上行：Group → Workspace）────────────
  /** 事件总线，有效事件类型：REMOVE */
  readonly bus: EventBus<WorkspaceCoordinationEvents>;

  // ── 信号通道（下行：Workspace → Group）────────────
  /** 可用规则因子定义列表（Workspace 级共享） */
  readonly allFactors: Signal<readonly RuleFactorDefinition[]>;
}

/**
 * Group 级协调实体（Group → Rule 协议）
 *
 * 事件总线（上行）：Rule → Group，有效事件类型 OK | EDIT | CANCEL | REMOVE
 * 信号通道（下行）：Group → Rule
 * - 子级 AtomicRuleScheduler 通过 computed 从 editingRuleId 派生 state
 * - 子级通过 factors 获取可用规则因子（组内已用因子标记 disabled，确保因子仅配置一次）
 */
export interface GroupCoordination {
  // ── 事件总线（上行：Rule → Group）────────────
  /** 事件总线，有效事件类型：OK | EDIT | CANCEL | REMOVE */
  readonly bus: EventBus<GroupCoordinationEvents>;
  // ── 信号通道（下行：Group → Rule）────────────
  /** 当前处于编辑态的 Rule ID（null 表示无编辑中的 Rule） */
  readonly editingRuleId: Signal<string | null>;
  /** 可用规则因子集合（源自 WorkspaceCoordination.allFactors，组内已使用的因子标记 disabled） */
  readonly factors: ReadonlySignal<readonly FieldDataSource[]>;
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
    bus: createNanoEvents<WorkspaceCoordinationEvents>(),
    allFactors: signal<readonly RuleFactorDefinition[]>([...factors]),
  };
}

/**
 * 创建 GroupCoordination 实例
 *
 * 由 AtomicRuleGroupScheduler 持有，供 AtomicRuleScheduler 消费
 */
export function createGroupCoordination(
  factors: ReadonlySignal<readonly FieldDataSource[]>
): GroupCoordination {
  return {
    bus: createNanoEvents<GroupCoordinationEvents>(),
    editingRuleId: signal<string | null>(null),
    factors,
  };
}
