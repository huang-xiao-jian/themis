import type { RuleFactorDefinition } from '../contracts/dsl';
import type { RuleGroup } from '../contracts/rule';
import type { FetcherRegistration } from '../factory/fetcher';
import type { Signal } from '../resource/resource';
import type { RuleGroupSetter } from './RuleGroupSetter';

/**
 * 规则配置器
 */
export interface RuleSetter {
  /** 已创建的规则组列表 */
  readonly ruleGroups: Signal<readonly RuleGroup[]>;

  /**
   * 创建规则组设置器
   */
  addGroup(groupId: string): RuleGroupSetter;

  /**
   * 获取规则因子定义
   */
  getFactor(name: string): RuleFactorDefinition | undefined;

  /**
   * 验证所有规则组
   */
  validate(): boolean;

  /**
   * 构建所有规则组
   */
  build(): readonly RuleGroup[];
}

/**
 * 创建规则配置器
 */
export function createRuleSetter(
  factors: RuleFactorDefinition[],
  fetchers: readonly FetcherRegistration[]
): RuleSetter {
  // 内部实现待补充
  throw new Error('Not implemented');
}
