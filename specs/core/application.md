# 应用层

编排领域逻辑，负责规则配置的数据、行为封装

## 前置依赖

- [规则配置内核](./spec.md)
- [领域层](./domain.md)
- [规则因子解释器](../interpreter.md)

## 层级间协议

三层调度器（`RuleWorkspaceScheduler` → `AtomicRuleGroupScheduler` → `AtomicRuleScheduler`）之间通过两个通道协作：

- **事件总线（上行）**：子级发射 `TransitionEvent` 通知父级用户行为的发生，事件订阅机制由依赖库（`nanoevents`）处理
- **信号通道（下行）**：父级通过层级协调实体封装共享状态，子级通过 `computed` 派生自身状态，父级不直接修改子级状态

每层协议显式包含事件总线与信号通道两部分，构成完整的层级通信契约。

### TransitionEvent 事件模型

事件是子级向父级通信的唯一载体，与用户行为入口对应

```ts
/**
 * 状态迁移事件类型
 *
 * - OK：用户确认配置（onOk）
 * - EDIT：用户请求进入编辑态（onEdit）
 * - CANCEL：用户取消编辑（onCancel，仅 Rule 级别）
 */
enum TransitionEventType {
  OK = 'ok',
  EDIT = 'edit',
  CANCEL = 'cancel',
}

/**
 * 状态迁移事件
 *
 * 事件流向：子级 → 父级（单向）
 */
interface TransitionEvent<TId = string> {
  /** 事件类型 */
  readonly type: TransitionEventType;
  /** 事件来源子级标识 */
  readonly sourceId: TId;
}
```

> **事件发射器**：子级 `Scheduler` 内部通过依赖库（`nanoevents`）提供事件订阅 / 取消订阅能力。`onOk`/`onEdit`/`onCancel` 内部触发事件发射，父级在创建子级时自动订阅，在销毁 / 移除子级时自动取消订阅。具体 `API` 由依赖库决定。

### 层级协调实体

每对父子级调度器之间使用独立的协调实体，显式封装事件总线与信号通道两部分，而非单个协议适用于多层级。每个父级调度器持有一个协调实体，子级通过该实体访问共享状态：

#### WorkspaceCoordination（Workspace → Group 协议）

`RuleWorkspaceScheduler` 持有，供 `AtomicRuleGroupScheduler` 消费。

**事件总线（上行：Group → Workspace）**：

| 事件类型 | 触发入口                            | 父级处理逻辑                                        |
| -------- | ----------------------------------- | --------------------------------------------------- |
| `OK`     | `AtomicRuleGroupScheduler.onOk()`   | 校验通过后更新 `editingGroupId.value = null`        |
| `EDIT`   | `AtomicRuleGroupScheduler.onEdit()` | 应用互斥约束后更新 `editingGroupId.value = groupId` |

**信号通道（下行：Workspace → Group）**：

```ts
/**
 * Workspace 级协调实体（Workspace → Group 协议）
 *
 * 事件总线（上行）：Group → Workspace，有效事件类型 OK | EDIT
 * 信号通道（下行）：Workspace → Group
 * - 子级 AtomicRuleGroupScheduler 通过 computed 从 editingGroupId 派生 state
 * - 子级通过 allFactors 共享规则因子定义
 */
interface WorkspaceCoordination {
  // ── 事件总线（上行：Group → Workspace）────────────
  /** 事件总线，有效事件类型：OK | EDIT（具体类型由依赖库 nanoevents 决定） */
  readonly bus: EventBus;

  // ── 信号通道（下行：Workspace → Group）────────────
  /** 当前处于编辑态的 Group ID（null 表示无编辑中的 Group） */
  readonly editingGroupId: Signal<string | null>;
  /** 可用规则因子定义列表（Workspace 级共享） */
  readonly allFactors: Signal<readonly RuleFactorDefinition[]>;
}

/** Workspace 级有效事件类型（Group → Workspace） */
type WorkspaceTransitionEvent = TransitionEvent & {
  readonly type: TransitionEventType.OK | TransitionEventType.EDIT;
};
```

#### GroupCoordination（Group → Rule 协议）

`AtomicRuleGroupScheduler` 持有，供 `AtomicRuleScheduler` 消费。

**事件总线（上行：Rule → Group）**：

| 事件类型 | 触发入口                         | 父级处理逻辑                                      |
| -------- | -------------------------------- | ------------------------------------------------- |
| `OK`     | `AtomicRuleScheduler.onOk()`     | 校验通过后更新 `editingRuleId.value = null`       |
| `EDIT`   | `AtomicRuleScheduler.onEdit()`   | 应用互斥约束后更新 `editingRuleId.value = ruleId` |
| `CANCEL` | `AtomicRuleScheduler.onCancel()` | 更新 `editingRuleId.value = null`                 |

**信号通道（下行：Group → Rule）**：

```ts
/**
 * Group 级协调实体（Group → Rule 协议）
 *
 * 事件总线（上行）：Rule → Group，有效事件类型 OK | EDIT | CANCEL
 * 信号通道（下行）：Group → Rule
 * - 子级 AtomicRuleScheduler 通过 computed 从 editingRuleId 派生 state
 * - 子级通过 factors 获取可用规则因子（组内已用因子标记 disabled，确保因子仅配置一次）
 */
interface GroupCoordination {
  // ── 事件总线（上行：Rule → Group）────────────
  /** 事件总线，有效事件类型：OK | EDIT | CANCEL（具体类型由依赖库 nanoevents 决定） */
  readonly bus: EventBus;

  // ── 信号通道（下行：Group → Rule）────────────
  /** 当前处于编辑态的 Rule ID（null 表示无编辑中的 Rule） */
  readonly editingRuleId: Signal<string | null>;
  /** 可用规则因子集合（源自 WorkspaceCoordination.allFactors，组内已使用的因子标记 disabled） */
  readonly factors: Signal<FieldDataSource[]>;
}

/** Group 级有效事件类型（Rule → Group） */
type GroupTransitionEvent = TransitionEvent & {
  readonly type: TransitionEventType.OK | TransitionEventType.EDIT | TransitionEventType.CANCEL;
};
```

**层级间通信契约一览**：

| 协议层级          | 协调实体                | 事件总线（上行）                               | 信号通道（下行）                |
| ----------------- | ----------------------- | ---------------------------------------------- | ------------------------------- |
| Workspace → Group | `WorkspaceCoordination` | `WorkspaceTransitionEvent`（OK \| EDIT）       | `editingGroupId` + `allFactors` |
| Group → Rule      | `GroupCoordination`     | `GroupTransitionEvent`（OK \| EDIT \| CANCEL） | `editingRuleId` + `factors`     |

**状态流转路径**：

1. 子级发射事件（如 `emit(OK, ruleId)`），事件类型受层级协议约束
2. 父级 `handler` 接收事件，按协议定义的处理逻辑更新协调实体中的共享 `Signal`
3. 子级 `state`（`computed`）自动响应变化，无需父级直接修改子级状态

事件流转全景（以 Rule 确认为例）：

```mermaid
sequenceDiagram
  participant U as User（视图层）
  participant R as AtomicRuleScheduler
  participant G as AtomicRuleGroupScheduler
  participant GC as GroupCoordination

  U->>R: onOk()（事件总线：上行 GroupTransitionEvent.OK）
  activate R
  R->>R: 内部校验 + 更新数据
  R->>G: emit(OK, ruleId)（nanoevents）
  G->>GC: editingRuleId.value = null（信号通道：下行）
  GC-->>R: state = LOCKED（computed 自动响应）
  deactivate R
```

## 调度器状态控制

`AtomicRuleScheduler` 与 `AtomicRuleGroupScheduler` 均引入 **编辑态 / 锁定态** 状态控制，确保用户操作的有序性。

```ts
/**
 * 调度器状态枚举
 *
 * 控制 Scheduler 的可编辑性，编辑态允许修改表单字段，锁定态禁止修改（删除不受影响）
 */
enum SchedulerState {
  /** 编辑态 - 允许修改表单字段 */
  EDITING = 'editing',
  /** 锁定态 - 禁止修改表单字段（删除操作不受限制） */
  LOCKED = 'locked',
}
```

```mermaid
stateDiagram-v2
  [*] --> EDITING : CREATED（新建）
  [*] --> LOCKED : HYDRATED（存量）

  LOCKED --> EDITING : REQUEST_EDIT
  EDITING --> LOCKED : CONFIRMED
  EDITING --> LOCKED : CANCELLED

  EDITING --> [*] : DELETED
  LOCKED --> [*] : DELETED

  note right of LOCKED : 表单字段只读
  note right of EDITING : 表单字段可编辑
```

## 调度器规则控制

### 并行编辑约束

分级独立控制，各级仅约束直接子级

- `AtomicRuleGroupScheduler` 级别：最多 **1 个 Rule** 处于编辑态，存在编辑中的 `Rule` 时禁用 **新增功能**
- `RuleWorkspaceScheduler` 级别：最多 **1 个 Group** 处于编辑态；存在编辑中的 `Group`，或存在配置规则为空的 `Group` 时，禁用 **新增功能**

### 业务规则校验

`build` 阶段执行业务规则

- `AtomicRuleGroupScheduler.build()`：规则组至少包含 **1 条已配置的原子规则**
- `RuleWorkspaceScheduler.build()`：工作空间至少包含 **1 个已配置的规则组**
- 校验不通过时 `build()` 抛出异常，调用方应先用 `validate()` 进行前置检查

## AtomicRuleScheduler

原子规则调度器。自身状态通过 `computed` 从所属 `AtomicRuleGroupScheduler` 的 `GroupCoordination` 派生，暴露只读状态信号、Formily 表单委托，以及用户行为接收入口。内部将调度器状态同步到 Formily Form 的 `pattern` 属性。

> **协议角色**：事件总线（发射 `GroupTransitionEvent` 给 Group）+ 信号通道（从 Group 的 `GroupCoordination.editingRuleId` 派生 `state`，通过 `GroupCoordination.factors` 获取可用规则因子）。

```ts
interface AtomicRuleScheduler {
  // ─── 状态（从 Group.GroupCoordination.editingRuleId computed 派生）──────
  /** 唯一标识 */
  readonly id: string;
  /**
   * 当前状态（编辑态 / 锁定态）
   *
   * 通过 `computed` 从所属 Group 的 `GroupCoordination.editingRuleId` 派生：
   * `GroupCoordination.editingRuleId === this.id` → EDITING，否则 → LOCKED
   */
  readonly state: Signal<SchedulerState>;
  /** 是否处于编辑态（派生信号，便于视图层绑定） */
  readonly editable: Signal<boolean>;
  /**
   * 上次用户确认且数据无误时更新的原子规则配置
   *
   * 与 Formily Form 的不稳定态隔离：Form 字段的实时变化不影响 rule，仅在 onOk() 且内部校验通过后更新。
   * `build()` 返回值与 `rule.value` 始终一致
   */
  readonly rule: Signal<AtomicRule>;
  /** 关联的表单实例（等效 Formily `Form`，由 createForm 创建，effects 驱动推断联动） */
  readonly form: AtomicRuleForm;

  // ─── 推断数据（由 form effects 更新，供视图层消费）────────────
  /** 可用的匹配操作符列表（同步注入 form 中 operator 字段的 dataSource） */
  readonly operators: Signal<readonly FieldDataSource[]>;
  /** threshold 渲染组件属性（同步注入 form 中 threshold 字段的 component） */
  readonly thresholder: Signal<ThresholdComponentProperties>;

  /** 验证配置是否完整可用 */
  validate(): boolean;
  /** 构建原子规则（返回值与 rule.value 始终一致） */
  build(): AtomicRule;

  // ─── 用户行为接入（发射 TransitionEvent 给 Group）────────
  /**
   * 确认规则配置（用户行为驱动）
   *
   * 内部判断表单配置是否满足规则约束，更新内部数据，然后发射 `TransitionEventType.OK` 事件
   */
  onOk(): void;

  /**
   * 取消规则配置（用户行为驱动）
   *
   * 无内部逻辑，直接发射 `TransitionEventType.CANCEL` 事件
   */
  onCancel(): void;

  /**
   * 激活规则配置编辑（用户行为驱动）
   *
   * 创建 Formily Form 实例（AtomicRuleForm），同步 pattern 为 editable，然后发射 `TransitionEventType.EDIT` 事件
   */
  onEdit(): void;
}
```

## AtomicRuleForm

`AtomicRuleForm` 等效于 Formily `Form` 实例，不引入额外包装层。

```ts
import type { Form } from '@formily/core';

/**
 * 原子规则表单 = Formily Form
 *
 * 创建时通过 effects 注册推断联动：name 变化 → 推断 operators / thresholder → 重置 operator / threshold
 *
 * **状态约束**：表单 pattern 由所属 AtomicRuleScheduler 控制
 * - EDITING → `pattern = 'editable'`
 * - LOCKED → `pattern = 'disabled'`
 *
 * 三个核心字段（由 createField 创建）：
 * - name：规则因子（Select，dataSource 来源于 Group 级 factors）
 * - operator：操作符（Select，dataSource 来源于推断结果）
 * - threshold：阈值（动态组件，组件类型来源于推断结果）
 */
type AtomicRuleForm = Form;
```

规则因子选择联动流程（编辑态下，由 Formily `effects` 驱动）：

```mermaid
sequenceDiagram
  participant U as User
  participant FM as Form（AtomicRuleForm）
  participant OI as OperatorInferrer
  participant TI as ThresholderInferrer

  U->>FM: field(name).value = 'employee'
  activate FM
  FM->>OI: infer(factor)
  OI-->>FM: operators
  FM->>TI: infer(factor)
  TI-->>FM: thresholder
  FM->>FM: field(operator/threshold) 重置
  deactivate FM
```

**状态切换与互斥流程**（事件总线上行 + 信号通道下行完整链路）：

```mermaid
sequenceDiagram
  participant U as User（视图层）
  participant WS as RuleWorkspaceScheduler
  participant WC as WorkspaceCoordination
  participant G as AtomicRuleGroupScheduler
  participant GC as GroupCoordination
  participant R as AtomicRuleScheduler

  Note over WS, R: 信号通道（下行）：父级通过层级协调实体封装共享 Signal，子级 computed 派生状态

  rect rgb(240, 248, 255)
    Note over U, WC: 外部调用 transitionState → 父级更新协调实体 → 子级状态自动响应
    U->>WS: transitionState(groupId, EDITING)
    WS->>WC: editingGroupId.value = groupId
    WC-->>G: state = EDITING（computed 自动响应）

    U->>G: transitionState(ruleId, EDITING)
    G->>GC: editingRuleId.value = ruleId
    GC-->>R: state = EDITING（computed 自动响应）
  end

  rect rgb(255, 248, 240)
    Note over U, GC: 事件总线（上行）：子级发射事件 → 父级更新协调实体 → 子级状态自动响应
    U->>R: onOk()
    R->>R: 内部校验 + 更新数据
    R->>G: emit(OK, ruleId)（nanoevents）
    G->>GC: editingRuleId.value = null
    GC-->>R: state = LOCKED（computed 自动响应）

    U->>G: onOk()
    G->>G: 内部校验 + 更新数据
    G->>WS: emit(OK, groupId)（nanoevents）
    WS->>WC: editingGroupId.value = null（级联：editingRuleId 也置 null）
    WC-->>G: state = LOCKED（computed 自动响应）
    GC-->>R: state = LOCKED（级联响应）
  end
```

## AtomicRuleGroupScheduler

规则组设置器管理原子规则集合：

```ts
/**
 * 规则因子选项推断器
 *
 * 1. 数据源：WorkspaceCoordination.allFactors（RuleWorkspace 通过 WorkspaceCoordination 共享的规则因子定义列表）
 * 2. 排除规则：已存在于 rules.signal 中的原子规则的 name（通过 usedFactors 获取）
 * 3. 输出格式：转换为 FieldDataSource[] 供 Select 组件使用，已使用的因子标记 disabled
 * 4. 作用域：AtomicRuleGroup 级别，每个规则组独立计算
 */
class FactorOptionsInferrer {
  infer(
    allFactors: readonly RuleFactorDefinition[],
    usedFactorNames: readonly string[]
  ): readonly FieldDataSource[];
}

/** 规则组初始化数据（编辑场景） */
interface AtomicRuleGroup {
  /** 唯一标识 */
  readonly id: string;
  /** 已有的原子规则列表 */
  readonly rules: readonly AtomicRule[];
}

/**
 * 规则组设置器
 *
 * **协议角色**：事件总线（发射 `WorkspaceTransitionEvent` 给 Workspace）+ 信号通道（从 Workspace 的 `WorkspaceCoordination.editingGroupId` 派生 `state`，同时通过自身 `GroupCoordination` 供 Rule 消费）
 *
 * 管理原子规则集合，并实现规则配置约束：
 * - 特定规则因子仅允许配置一次（通过 usedFactors + factors.disabled 实现）
 * - 原子规则最大数量等同于规则因子的数量（通过 canAddRule 暴露）
 * - 编辑态 / 锁定态状态通过 `computed` 从 Workspace 的 `WorkspaceCoordination.editingGroupId` 派生
 * - 组内不支持并行编辑，最多 1 个 Rule 处于编辑态；存在编辑中的 Rule 时禁用 addRule
 */
interface AtomicRuleGroupScheduler {
  /** 规则组唯一标识 */
  readonly id: string;
  /**
   * 当前状态（编辑态 / 锁定态）
   *
   * 通过 `computed` 从所属 Workspace 的 `WorkspaceCoordination.editingGroupId` 派生：
   * `WorkspaceCoordination.editingGroupId === this.id` → EDITING，否则 → LOCKED
   */
  readonly state: Signal<SchedulerState>;
  /** 是否处于编辑态（派生信号，便于视图层绑定） */
  readonly editable: Signal<boolean>;
  /** 已创建的规则实例列表 */
  readonly rules: Signal<readonly AtomicRuleScheduler[]>;
  /** 是否可继续添加原子规则（rules.length < maxRuleCount 且存在未使用的规则因子，且当前无编辑中的 Rule） */
  readonly canAddRule: Signal<boolean>;

  // ─── 协调实体（Group → Rule 层级协议）────────────
  /**
   * Group 级协调实体，封装供子级 Rule 派生状态的共享信号
   *
   * `GroupCoordination.editingRuleId`：当前处于编辑态的 Rule ID（`null` 表示无编辑中的 Rule）
   * `GroupCoordination.factors`：可用规则因子集合（组内已用因子标记 disabled）
   * `AtomicRuleScheduler.state` 通过 `computed` 从 `GroupCoordination.editingRuleId` 派生
   */
  readonly coordination: GroupCoordination;

  // ─── 生命周期管理（对 Rule）────────────
  /**
   * 创建原子规则设置器（新建场景）
   *
   * **状态约束**：仅 Group 处于编辑态时允许调用
   * **互斥行为**：新建的 Rule 默认进入编辑态（`GroupCoordination.editingRuleId` 更新为新 Rule ID），当前编辑中的 Rule（如有）自动锁定
   * **前置约束**：canAddRule=false 时调用静默忽略
   * **事件订阅**：创建后自动订阅 Rule 的 TransitionEvent（由 nanoevents 处理）
   */
  addRule(): AtomicRuleScheduler;
  /**
   * 获取原子规则设置器（精细操作场景）
   */
  pickRule(ruleId: string): AtomicRuleScheduler | undefined;
  /**
   * 移除原子规则
   *
   * **状态无关**：删除操作不受锁定态限制，任何状态下均可执行
   */
  removeRule(ruleId: string): void;
  /**
   * 恢复原子规则设置器（编辑场景）
   *
   * 恢复的 Rule 默认进入 **锁定态**
   */
  hydrateRule(rule: AtomicRule): void;

  /**
   * 切换指定规则的状态（内部更新 GroupCoordination.editingRuleId Signal）
   *
   * - 目标为 EDITING：应用互斥约束，更新 `GroupCoordination.editingRuleId.value = ruleId`，返回是否成功
   * - 目标为 LOCKED：更新 `GroupCoordination.editingRuleId.value = null`，始终返回 true
   * - 子级 `AtomicRuleScheduler.state` 通过 `computed` 自动响应
   */
  transitionState(ruleId: string, state: SchedulerState): boolean;

  /** 验证所有原子规则 */
  validate(): boolean;
  /**
   * 构建规则组
   *
   * **业务校验**：规则组至少包含 1 条已配置的原子规则，校验不通过时抛出异常
   */
  build(): AtomicRuleGroup;

  // ─── 用户行为接入（发射 TransitionEvent 给 Workspace）────────
  /**
   * 确认配置规则（用户行为驱动）
   *
   * 内部判断规则组配置是否满足约束，更新内部数据，然后发射 `TransitionEventType.OK` 事件
   */
  onOk(): void;

  /**
   * 激活配置编辑（用户行为驱动）
   *
   * 发射 `TransitionEventType.EDIT` 事件
   */
  onEdit(): void;
}
```

**特别说明**：

- `FactorOptionsInferrer` 属于 `AtomicRuleGroup` 级别，每个规则组独立维护自己的 `factors`，不同规则组之间 **不共享**
- `canAddRule` 综合数量约束（`rules.length < WorkspaceCoordination.allFactors.length`）与 **编辑互斥约束**
- `addRule` 仅在 `Group` 处于编辑态时允许调用，锁定态调用静默忽略
- `removeRule` 不受状态约束，锁定态下仍可删除规则

## RuleWorkspaceScheduler

统一入口，持有规则因子定义供调度器共享，并提供完整的生命周期管理能力：

> **协议角色**：信号通道（通过 `WorkspaceCoordination` 封装 `editingGroupId` + `allFactors`）+ 事件总线（订阅 Group 的 `WorkspaceTransitionEvent`）。Workspace 是协议层级的顶部，无父级。

```ts
interface RuleWorkspaceScheduler {
  /** 初始化时传入的规则组快照数据（编辑场景），不可变 */
  readonly snapshots: readonly AtomicRuleGroup[];
  /** 已创建的规则组实例列表 */
  readonly groups: Signal<readonly AtomicRuleGroupScheduler[]>;
  /** 是否可继续添加规则组（当前无编辑中的 Group，且不存在配置规则为空的 Group） */
  readonly canAddGroup: Signal<boolean>;

  // ─── 协调实体（Workspace → Group 层级协议）────────────
  /**
   * Workspace 级协调实体，封装供子级 Group 派生状态的共享信号
   *
   * `WorkspaceCoordination.editingGroupId`：当前处于编辑态的 Group ID（`null` 表示无编辑中的 Group）
   * `WorkspaceCoordination.allFactors`：可用规则因子定义列表
   * `AtomicRuleGroupScheduler.state` 通过 `computed` 从 `WorkspaceCoordination.editingGroupId` 派生
   */
  readonly coordination: WorkspaceCoordination;

  // ─── 生命周期管理（对 Group）────────────
  /**
   * 创建规则组设置器（新建场景）
   *
   * **状态约束**：仅 Workspace 处于可编辑状态时允许调用
   * **互斥行为**：新建的 Group 默认进入编辑态（`WorkspaceCoordination.editingGroupId` 更新为新 Group ID），当前编辑中的 Group（如有）自动锁定
   * **前置约束**：canAddGroup=false 时调用静默忽略
   * **事件订阅**：创建后自动订阅 Group 的 TransitionEvent（由 nanoevents 处理）
   */
  addGroup(): AtomicRuleGroupScheduler;
  /**
   * 获取规则组设置器（精细操作场景）
   */
  pickGroup(groupId: string): AtomicRuleGroupScheduler | undefined;
  /**
   * 移除规则组
   *
   * **状态无关**：删除操作不受锁定态限制，任何状态下均可执行
   */
  removeGroup(groupId: string): void;
  /**
   * 恢复规则组设置器（编辑场景）
   *
   * 恢复的 Group 及其内部 Rule 默认进入 **锁定态**
   */
  hydrateGroup(group: AtomicRuleGroup): void;

  // 状态控制
  /**
   * 切换指定规则组的状态（内部更新 WorkspaceCoordination.editingGroupId Signal）
   *
   * - 目标为 EDITING：应用互斥约束，更新 `WorkspaceCoordination.editingGroupId.value = groupId`
   * - 目标为 LOCKED：更新 `WorkspaceCoordination.editingGroupId.value = null`，级联锁定组内所有编辑中的 Rule
   * - 子级 `AtomicRuleGroupScheduler.state` 通过 `computed` 自动响应
   */
  transitionState(groupId: string, state: SchedulerState): boolean;

  // 验证与构建
  /** 验证所有规则组 */
  validate(): boolean;
  /**
   * 构建所有规则组
   *
   * **业务校验**：工作空间至少包含 1 个已配置的规则组，校验不通过时抛出异常
   */
  build(): readonly AtomicRuleGroup[];

  // 生命周期管理
  /** 销毁工作空间，释放所有资源（订阅、缓存等） */
  destroy(): void;
}
```
