import type { RuleFactorDefinition } from '../contracts/dsl';
import type { AtomicRule, RuleGroup } from '../contracts/rule';
import type { Signal } from '../resource/resource';
import type { AtomicRuleSetter } from './AtomicRuleSetter';

/**
 * 规则组设置器
 */
export interface RuleGroupSetter {
  /** 规则组名称 */
  readonly name: string;
  /** 已配置的原子规则列表 */
  readonly rules: Signal<readonly AtomicRule[]>;
  /** 可用的规则因子列表（已排除已使用的规则因子） */
  readonly availableFactors: Signal<readonly RuleFactorDefinition[]>;

  /**
   * 创建原子规则设置器
   */
  add(ruleId: string): AtomicRuleSetter;

  /**
   * 移除原子规则
   */
  remove(ruleId: string): void;

  /**
   * 构建规则组
   */
  build(): RuleGroup;
}
