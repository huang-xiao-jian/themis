import { signal, computed } from 'alien-signals';
import type {
  IAtomicRuleGroupScheduler,
  IAtomicRuleScheduler,
} from '../types/Scheduler';
import type { AtomicRule, AtomicRuleGroup, AtomicRuleData } from '../types/Scheduler';
import type { RuleFactorDefinition } from '../types/DSL';
import type { Resource } from '../types/Resource';
import { AtomicRuleScheduler } from './AtomicRuleScheduler';

/**
 * 规则组设置器实现
 */
export class AtomicRuleGroupScheduler implements IAtomicRuleGroupScheduler {
  readonly id: string;
  readonly snapshot: readonly AtomicRule[];
  readonly rules: IAtomicRuleGroupScheduler['rules'];
  readonly factors: IAtomicRuleGroupScheduler['factors'];
  readonly factorOptions: IAtomicRuleGroupScheduler['factorOptions'];

  private readonly _rules: ReturnType<typeof signal<readonly IAtomicRuleScheduler[]>>;
  private readonly _factors: RuleFactorDefinition[];
  private readonly _rulesMap: Map<string, IAtomicRuleScheduler>;
  private readonly _resourceRegistry: Map<string, Resource>;
  private readonly _usedFactorNames: Set<string>;
  private readonly _groupId: string;

  constructor(
    id: string,
    factors: RuleFactorDefinition[],
    resourceRegistry: Map<string, Resource>,
    snapshot?: readonly AtomicRuleData[]
  ) {
    this.id = id;
    this._groupId = id;
    this._factors = factors;
    this._resourceRegistry = resourceRegistry;
    this._rulesMap = new Map();
    this._usedFactorNames = new Set();

    // 从 snapshot 恢复已有规则
    if (snapshot) {
      snapshot.forEach((rule) => {
        this.addRule(rule.id, rule);
      });
    }

    // 初始化 Signal
    this._rules = signal<readonly IAtomicRuleScheduler[]>([...this._rulesMap.values()]);
    this.rules = this._rules;
    this.snapshot = snapshot
      ? snapshot.map((r) => ({
          id: r.id,
          name: r.name,
          operator: r.operator,
          threshold: r.threshold,
        }))
      : [];

    // 计算属性：factorOptions 需要排除已使用的规则因子
    const factorOptionsComputed = computed(() =>
      this._factors
        .filter((f) => !this._usedFactorNames.has(f.name))
        .map((f) => ({ label: f.title, value: f.name }))
    );
    this.factorOptions = factorOptionsComputed;
    this.factors = signal(factors);
  }

  addRule(ruleId: string, initialData?: { name: string; operator: string; threshold: unknown }): IAtomicRuleScheduler {
    const scheduler = new AtomicRuleScheduler(
      ruleId,
      this._groupId,
      this._factors,
      this._resourceRegistry,
      this._usedFactorNames,
      initialData
    );
    this._rulesMap.set(ruleId, scheduler);
    this._rules([...this._rulesMap.values()]);
    return scheduler;
  }

  removeRule(ruleId: string): void {
    const scheduler = this._rulesMap.get(ruleId);
    if (scheduler) {
      (scheduler as AtomicRuleScheduler).release();
      this._rulesMap.delete(ruleId);
      this._rules([...this._rulesMap.values()]);
    }
  }

  validate(): boolean {
    return [...this._rulesMap.values()].every((s) => s.validate());
  }

  build(): AtomicRuleGroup {
    return {
      rules: [...this._rulesMap.values()].map((s) => s.build()),
    };
  }

  /**
   * 释放所有资源
   */
  dispose(): void {
    this._rulesMap.forEach((s) => (s as AtomicRuleScheduler).release());
    this._rulesMap.clear();
  }
}