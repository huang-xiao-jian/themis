import type { RuleFactorDefinition } from '../contracts/dsl';
import type { AtomicRule } from '../contracts/rule';
import type { Signal } from '../resource/resource';

/**
 * 原子规则设置器
 */
export interface AtomicRuleSetter {
  /** 唯一标识 */
  readonly id: string;
  /** 已激活的规则因子定义 */
  readonly factor: Signal<RuleFactorDefinition | null>;
  /** 可用的匹配操作符列表（由推断机制计算） */
  readonly operators: Signal<readonly string[]>;
  /** 选中的操作符 */
  readonly operator: Signal<string | null>;
  /** 阈值（外部注入） */
  readonly threshold: Signal<unknown>;
  /** 响应式资源（供适配层使用） */
  readonly resource: Signal<import('../resource/resource').ResponseResource | null>;

  /**
   * 切换规则因子（自动重置 operator/threshold）
   */
  switch(name: string): void;

  /**
   * 验证阈值是否符合约束
   */
  validate(threshold: unknown): boolean;

  /**
   * 构建原子规则
   */
  build(): AtomicRule;
}
