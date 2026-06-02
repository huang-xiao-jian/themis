import { batch, computed, signal, type ReadonlySignal, type Signal } from '@preact/signals-core';
import type { ThresholdComponentProperties } from '../component/ThresholdComponentProperties';
import type { AtomicRule } from '../dsl/AtomicRule';
import type { FieldDataSource } from '../dsl/FieldDataSource';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import { OperatorInferrer } from '../inferrer/OperatorInferrer';
import { ThresholderInferrer } from '../inferrer/ThresholderInferrer';

/**
 * 表单字段标识
 */
export type FieldName = 'name' | 'operator' | 'threshold';

/**
 * 表单字段变更 Action
 */
export interface FieldChangeAction {
  readonly field: FieldName;
  readonly value: unknown;
}

/**
 * 原子规则设置器
 *
 * 负责单个原子规则的状态管理、推断联动、生命周期管理
 */
export class AtomicRuleScheduler {
  readonly id: string;
  readonly factor: ReadonlySignal<RuleFactorDefinition | null>;
  readonly operators: ReadonlySignal<readonly FieldDataSource[]>;
  readonly thresholder: ReadonlySignal<ThresholdComponentProperties | null>;
  readonly name: Signal<string | null>;
  readonly operator: Signal<string | null>;
  readonly threshold: Signal<unknown>;

  private readonly factors: ReadonlySignal<readonly RuleFactorDefinition[]>;
  private readonly operatorInferrer = new OperatorInferrer();
  private readonly thresholderInferrer: ThresholderInferrer;
  private readonly unsubscribers: (() => void)[] = [];
  private destroyed = false;

  constructor(
    id: string,
    factors: ReadonlySignal<readonly RuleFactorDefinition[]>,
    thresholderInferrer: ThresholderInferrer,
    snapshot?: AtomicRule
  ) {
    this.id = id;
    this.factors = factors;
    this.thresholderInferrer = thresholderInferrer;
    this.name = signal<string | null>(snapshot?.name ?? null);
    this.operator = signal<string | null>(snapshot?.operator ?? null);
    this.threshold = signal<unknown>(snapshot?.threshold);

    // factor 由 name + factors 派生
    this.factor = computed(() => {
      const n = this.name.value;
      if (n == null) return null;
      return this.factors.value.find((f) => f.name === n) ?? null;
    });

    // operators 由 factor 派生
    this.operators = computed<readonly FieldDataSource[]>(() => {
      const f = this.factor.value;
      if (!f) return [];
      return this.operatorInferrer.infer(f);
    });

    // thresholder 由 factor 派生
    this.thresholder = computed<ThresholdComponentProperties | null>(() => {
      const f = this.factor.value;
      if (!f) return null;
      return this.thresholderInferrer.infer(f);
    });

    // 用户决策：用 subscribe 而非 effect，避免初始化时立即重置
    // signals-core 的 subscribe 内部用 effect 实现，effect 第一次会立即执行回调
    // 因此用 firstRun 标志位跳过首次执行，保证编辑场景下 snapshot 还原不被误清空
    let firstRun = true;
    const unsubscribe = this.name.subscribe(() => {
      if (this.destroyed) return;
      if (firstRun) {
        firstRun = false;
        return;
      }
      // name 变化 → 重置 operator / threshold
      batch(() => {
        this.operator.value = null;
        this.threshold.value = undefined;
      });
    });
    this.unsubscribers.push(unsubscribe);
  }

  /**
   * 表单字段变更回调
   */
  onFieldChange = (action: FieldChangeAction): void => {
    if (this.destroyed) return;
    switch (action.field) {
      case 'name':
        // 只有在 name 真正变化时才赋值（subscribe 才会触发重置）
        if (this.name.value !== (action.value as string | null)) {
          this.name.value = action.value as string | null;
        }
        return;
      case 'operator':
        this.operator.value = action.value as string | null;
        return;
      case 'threshold':
        this.threshold.value = action.value;
        return;
    }
  };

  /**
   * 验证配置是否完整
   */
  validate(): boolean {
    return (
      this.factor.value !== null &&
      this.operator.value !== null &&
      this.threshold.value !== null &&
      this.threshold.value !== undefined
    );
  }

  /**
   * 构建原子规则
   */
  build(): AtomicRule {
    if (!this.validate()) {
      throw new Error(
        `[sisyphus] AtomicRuleScheduler "${this.id}" is not complete. ` +
          `Ensure factor/operator/threshold are all set.`
      );
    }
    return {
      id: this.id,
      name: this.name.value as string,
      operator: this.operator.value as string,
      threshold: this.threshold.value,
    };
  }

  /**
   * 销毁并释放订阅
   */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const fn of this.unsubscribers) {
      fn();
    }
    this.unsubscribers.length = 0;
  }
}
