import { computed, signal, type ReadonlySignal, type Signal } from '@preact/signals-core';
import type { AtomicRule, AtomicRuleGroup } from '../dsl/AtomicRule';
import type { FieldDataSource } from '../dsl/FieldDataSource';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import { FactorOptionsInferrer } from '../inferrer/FactorOptionsInferrer';
import type { ThresholderInferrer } from '../inferrer/ThresholderInferrer';
import { AtomicRuleScheduler } from './AtomicRuleScheduler';

/**
 * 规则组设置器
 *
 * 负责管理一组 AtomicRuleScheduler，并提供 factorOptions 推断
 */
export class AtomicRuleGroupScheduler {
  readonly id: string;
  readonly snapshots: readonly AtomicRule[];
  readonly rules: Signal<readonly AtomicRuleScheduler[]>;
  readonly factors: ReadonlySignal<readonly RuleFactorDefinition[]>;
  readonly factorOptions: ReadonlySignal<readonly FieldDataSource[]>;

  private readonly factorOptionsInferrer = new FactorOptionsInferrer();
  private readonly thresholderInferrer: ThresholderInferrer;
  private destroyed = false;

  constructor(
    id: string,
    factors: Signal<readonly RuleFactorDefinition[]>,
    thresholderInferrer: ThresholderInferrer,
    snapshot?: AtomicRuleGroup
  ) {
    this.id = id;
    this.snapshots = snapshot?.rules ?? [];
    this.factors = factors;
    this.thresholderInferrer = thresholderInferrer;

    // 编辑场景：从 snapshot 构造初始 rule scheduler
    const initialRules: AtomicRuleScheduler[] = (snapshot?.rules ?? []).map(
      (rule) => new AtomicRuleScheduler(rule.id, factors, thresholderInferrer, rule)
    );
    this.rules = signal<readonly AtomicRuleScheduler[]>(initialRules);

    // factorOptions 派生自当前 rules（不是 snapshots）
    this.factorOptions = computed<readonly FieldDataSource[]>(() => {
      const usedNames = new Set<string>();
      for (const rule of this.rules.value) {
        if (rule.name.value != null) {
          usedNames.add(rule.name.value);
        }
      }
      return this.factorOptionsInferrer.infer(this.factors.value, usedNames);
    });
  }

  /**
   * 新增原子规则
   */
  addRule(ruleId: string): AtomicRuleScheduler {
    if (this.destroyed) {
      throw new Error(`[sisyphus] AtomicRuleGroupScheduler "${this.id}" is destroyed.`);
    }
    const scheduler = new AtomicRuleScheduler(ruleId, this.factors, this.thresholderInferrer);
    this.rules.value = [...this.rules.value, scheduler];
    return scheduler;
  }

  /**
   * 移除原子规则
   */
  removeRule(ruleId: string): void {
    if (this.destroyed) return;
    const next: AtomicRuleScheduler[] = [];
    for (const r of this.rules.value) {
      if (r.id === ruleId) {
        r.destroy();
      } else {
        next.push(r);
      }
    }
    this.rules.value = next;
  }

  /**
   * 验证所有原子规则
   */
  validate(): boolean {
    if (this.rules.value.length === 0) return false;
    return this.rules.value.every((r) => r.validate());
  }

  /**
   * 构建规则组
   */
  build(): AtomicRuleGroup {
    if (!this.validate()) {
      throw new Error(
        `[sisyphus] AtomicRuleGroupScheduler "${this.id}" has incomplete rules. ` +
          `All rules must be complete.`
      );
    }
    return {
      rules: this.rules.value.map((r) => r.build()),
    };
  }

  /**
   * 销毁并释放所有子 scheduler
   */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const r of this.rules.value) {
      r.destroy();
    }
    this.rules.value = [];
  }
}
