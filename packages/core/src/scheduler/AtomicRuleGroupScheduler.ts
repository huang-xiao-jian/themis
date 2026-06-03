import { computed, signal, type ReadonlySignal, type Signal } from '@preact/signals-core';
import { nanoid } from 'nanoid';
import type { AtomicRule, AtomicRuleGroup } from '../dsl/AtomicRule';
import type { FieldDataSource } from '../dsl/FieldDataSource';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import { FactorOptionsInferrer } from '../inferrer/FactorOptionsInferrer';
import type { ThresholderInferrer } from '../inferrer/ThresholderInferrer';
import { AtomicRuleScheduler } from './AtomicRuleScheduler';

/**
 * 规则组设置器
 *
 * 管理原子规则集合，并实现规则配置约束：
 * - 特定规则因子仅允许配置一次（通过 usedFactors + factors.disabled 实现）
 * - 原子规则最大数量等同于规则因子的数量（通过 canAddRule 暴露）
 */
export class AtomicRuleGroupScheduler {
  readonly id: string;
  readonly snapshots: readonly AtomicRule[];
  readonly rules: Signal<readonly AtomicRuleScheduler[]>;
  readonly allFactors: ReadonlySignal<readonly RuleFactorDefinition[]>;
  /** Group 内部已使用的规则因子 */
  readonly usedFactors: ReadonlySignal<string[]>;
  /** 适配选择器的规则因子选项集合，需要 disable group 内部已使用的规则因子 */
  readonly factors: ReadonlySignal<readonly FieldDataSource[]>;
  /** 是否可继续添加原子规则（rules.length < allFactors.length） */
  readonly canAddRule: ReadonlySignal<boolean>;

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
    this.allFactors = factors;
    this.thresholderInferrer = thresholderInferrer;

    // 编辑场景：从 snapshot 构造初始 rule scheduler
    this.rules = signal<readonly AtomicRuleScheduler[]>([]);
    for (const rule of snapshot?.rules ?? []) {
      this.hydrateRule(rule);
    }

    // usedFactors 派生自当前 rules 中已选择的因子名称
    this.usedFactors = computed<string[]>(() => {
      const names: string[] = [];
      for (const rule of this.rules.value) {
        if (rule.name.value != null) {
          names.push(rule.name.value);
        }
      }
      return names;
    });

    // factors 派生自当前 rules（不是 snapshots）
    this.factors = computed<readonly FieldDataSource[]>(() => {
      return this.factorOptionsInferrer.infer(this.allFactors.value, this.usedFactors.value);
    });

    // canAddRule：规则数量尚未达到因子总数上限
    this.canAddRule = computed<boolean>(
      () => this.rules.value.length < this.allFactors.value.length
    );
  }

  /**
   * 恢复原子规则设置器（编辑场景）
   *
   * 从已有的 AtomicRule 数据创建 scheduler，保留原始 id / name / operator / threshold
   */
  hydrateRule(rule: AtomicRule): void {
    if (this.destroyed) {
      throw new Error(`[sisyphus] AtomicRuleGroupScheduler "${this.id}" is destroyed.`);
    }
    const scheduler = new AtomicRuleScheduler(
      rule.id,
      this.allFactors,
      this.thresholderInferrer,
      rule
    );
    this.rules.value = [...this.rules.value, scheduler];
  }

  /**
   * 新增原子规则（自动生成唯一标识）
   */
  addRule(): AtomicRuleScheduler {
    if (this.destroyed) {
      throw new Error(`[sisyphus] AtomicRuleGroupScheduler "${this.id}" is destroyed.`);
    }
    const scheduler = new AtomicRuleScheduler(nanoid(), this.allFactors, this.thresholderInferrer);
    this.rules.value = [...this.rules.value, scheduler];
    return scheduler;
  }

  /**
   * 获取原子规则设置器
   */
  pickRule(ruleId: string): AtomicRuleScheduler | undefined {
    return this.rules.value.find((r) => r.id === ruleId);
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
      id: this.id,
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
