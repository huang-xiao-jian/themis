import { signal, type ReadonlySignal, type Signal } from '@preact/signals-core';
import { nanoid } from 'nanoid';
import type { AtomicRuleGroup } from '../dsl/AtomicRule';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import type { ThresholderInferrer } from '../inferrer/ThresholderInferrer';
import { AtomicRuleGroupScheduler } from './AtomicRuleGroupScheduler';

/**
 * 工作空间调度器
 *
 * 顶层入口：管理所有规则组、共享因素定义、生命周期管理
 */
export class RuleWorkspaceScheduler {
  readonly snapshots: readonly AtomicRuleGroup[];
  readonly groups: Signal<readonly AtomicRuleGroupScheduler[]>;

  private readonly factors: Signal<readonly RuleFactorDefinition[]>;
  private readonly thresholderInferrer: ThresholderInferrer;
  private destroyed = false;

  constructor(
    factors: readonly RuleFactorDefinition[],
    thresholderInferrer: ThresholderInferrer,
    snapshots?: readonly AtomicRuleGroup[]
  ) {
    this.snapshots = snapshots ?? [];
    this.factors = signal<readonly RuleFactorDefinition[]>([...factors]);
    this.thresholderInferrer = thresholderInferrer;

    // 编辑场景：从 snapshots 构造初始 group scheduler
    this.groups = signal<readonly AtomicRuleGroupScheduler[]>([]);
    for (const g of snapshots ?? []) {
      this.hydrateGroup(g);
    }
  }

  /**
   * 获取规则因子定义（只读访问）
   */
  getFactors(): ReadonlySignal<readonly RuleFactorDefinition[]> {
    return this.factors;
  }

  /**
   * 恢复规则组设置器（编辑场景）
   *
   * 从已有的 AtomicRuleGroup 数据创建 scheduler，保留原始 id 及其内部规则
   */
  hydrateGroup(group: AtomicRuleGroup): void {
    if (this.destroyed) {
      throw new Error('[sisyphus] RuleWorkspaceScheduler is destroyed.');
    }
    const scheduler = new AtomicRuleGroupScheduler(
      group.id,
      this.factors,
      this.thresholderInferrer,
      group
    );
    this.groups.value = [...this.groups.value, scheduler];
  }

  /**
   * 新增规则组（自动生成唯一标识）
   */
  addGroup(): AtomicRuleGroupScheduler {
    if (this.destroyed) {
      throw new Error('[sisyphus] RuleWorkspaceScheduler is destroyed.');
    }
    const scheduler = new AtomicRuleGroupScheduler(
      nanoid(),
      this.factors,
      this.thresholderInferrer
    );
    this.groups.value = [...this.groups.value, scheduler];
    return scheduler;
  }

  /**
   * 获取规则组设置器
   */
  pickGroup(groupId: string): AtomicRuleGroupScheduler | undefined {
    return this.groups.value.find((g) => g.id === groupId);
  }

  /**
   * 移除规则组
   */
  removeGroup(groupId: string): void {
    if (this.destroyed) return;
    const next: AtomicRuleGroupScheduler[] = [];
    for (const g of this.groups.value) {
      if (g.id === groupId) {
        g.destroy();
      } else {
        next.push(g);
      }
    }
    this.groups.value = next;
  }

  /**
   * 验证所有规则组
   */
  validate(): boolean {
    if (this.groups.value.length === 0) return false;
    return this.groups.value.every((g) => g.validate());
  }

  /**
   * 构建所有规则组
   */
  build(): readonly AtomicRuleGroup[] {
    if (!this.validate()) {
      throw new Error(
        '[sisyphus] RuleWorkspaceScheduler has incomplete groups. ' +
          'All groups must contain valid rules.'
      );
    }
    return this.groups.value.map((g) => g.build());
  }

  /**
   * 销毁工作空间，释放所有资源
   */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const g of this.groups.value) {
      g.destroy();
    }
    this.groups.value = [];
  }
}
