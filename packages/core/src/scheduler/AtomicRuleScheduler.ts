import { signal, effect } from 'alien-signals';
import type { IAtomicRuleScheduler } from '../types/Scheduler';
import type { AtomicRule, FieldChangeAction } from '../types/Scheduler';
import type { RuleFactorDefinition } from '../types/DSL';
import type { FieldDataSource } from '../types/Fetcher';
import type { ThresholdComponentProperties } from '../types/Inference';
import type { Resource } from '../types/Resource';
import { inferOperators } from '../inference/OperatorInferrer';
import { inferComponent } from '../inference/ComponentInferrer';

/**
 * 原子规则设置器实现
 */
export class AtomicRuleScheduler implements IAtomicRuleScheduler {
  readonly id: string;
  readonly factor: IAtomicRuleScheduler['factor'];
  readonly operators: IAtomicRuleScheduler['operators'];
  readonly thresholder: IAtomicRuleScheduler['thresholder'];
  readonly name: IAtomicRuleScheduler['name'];
  readonly operator: IAtomicRuleScheduler['operator'];
  readonly threshold: IAtomicRuleScheduler['threshold'];

  private readonly _factor: ReturnType<typeof signal<RuleFactorDefinition | null>>;
  private readonly _operators: ReturnType<typeof signal<readonly FieldDataSource[]>>;
  private readonly _thresholder: ReturnType<typeof signal<ThresholdComponentProperties | null>>;
  private readonly _name: ReturnType<typeof signal<string | null>>;
  private readonly _operator: ReturnType<typeof signal<string | null>>;
  private readonly _threshold: ReturnType<typeof signal<unknown>>;
  private readonly _factors: RuleFactorDefinition[];
  private readonly _resourceRegistry: Map<string, Resource>;
  private readonly _usedFactorNames: Set<string>;
  private readonly _groupId: string;

  constructor(
    id: string,
    groupId: string,
    factors: RuleFactorDefinition[],
    resourceRegistry: Map<string, Resource>,
    usedFactorNames: Set<string>,
    initialData?: { name: string; operator: string; threshold: unknown }
  ) {
    this.id = id;
    this._groupId = groupId;
    this._factors = factors;
    this._resourceRegistry = resourceRegistry;
    this._usedFactorNames = usedFactorNames;

    // 初始化 Signal
    this._factor = signal<RuleFactorDefinition | null>(null);
    this._operators = signal<readonly FieldDataSource[]>([]);
    this._thresholder = signal<ThresholdComponentProperties | null>(null);
    this._name = signal<string | null>(null);
    this._operator = signal<string | null>(null);
    this._threshold = signal<unknown>(null as unknown);

    // 暴露 Signal
    this.factor = this._factor;
    this.operators = this._operators;
    this.thresholder = this._thresholder;
    this.name = this._name;
    this.operator = this._operator;
    this.threshold = this._threshold;

    // 建立响应式关联：当 factor 变化时重新推断 operators 和 thresholder
    effect(() => {
      const f = this._factor();
      if (f) {
        this._operators(inferOperators(f));
        const resource = f.resource ? this._resourceRegistry.get(f.resource.name) : undefined;
        this._thresholder(inferComponent(f, resource));
      } else {
        this._operators([]);
        this._thresholder(null);
      }
    });

    // 如果有初始数据，恢复状态
    if (initialData) {
      const factor = this._factors.find((f) => f.name === initialData.name);
      if (factor) {
        this._factor(factor);
        this._name(factor.name);
        this._operator(initialData.operator);
        this._threshold(initialData.threshold);
        this._usedFactorNames.add(factor.name);
      }
    }
  }

  readonly onFieldChange = (action: FieldChangeAction): void => {
    switch (action.field) {
      case 'name': {
        // 查找 factor 定义
        const factor = this._factors.find((f) => f.name === action.value);
        // 释放旧的 factor 名称
        const oldFactor = this._factor();
        if (oldFactor) {
          this._usedFactorNames.delete(oldFactor.name);
        }
        // 设置新的 factor
        this._factor(factor ?? null);
        this._name(action.value as string);
        // 重置 operator 和 threshold
        this._operator(null);
        this._threshold(null as unknown);
        if (factor) {
          this._usedFactorNames.add(factor.name);
        }
        break;
      }
      case 'operator':
        this._operator(action.value as string);
        break;
      case 'threshold':
        this._threshold(action.value);
        break;
    }
  };

  validate(): boolean {
    return (
      this._factor() !== null &&
      this._operator() !== null &&
      this._threshold() !== null
    );
  }

  build(): AtomicRule {
    return {
      id: this.id,
      name: this._factor()!.name,
      operator: this._operator()!,
      threshold: this._threshold(),
    };
  }

  /**
   * 释放占用的 factor 名称
   */
  release(): void {
    const factor = this._factor();
    if (factor) {
      this._usedFactorNames.delete(factor.name);
    }
  }
}