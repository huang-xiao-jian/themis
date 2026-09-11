import type { AtomicRuleGroup } from '../dsl/AtomicRule';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import type { FetcherProvider } from '../fetcher/FetcherProvider';
import { RuleWorkspaceScheduler } from '../scheduler/RuleWorkspaceScheduler';
/**
 * 简化工厂函数 - 一站式创建工作空间
 *
 * 适合简单场景；推荐新手使用
 */
export declare function createRuleWorkspace(config: {
  factors: readonly RuleFactorDefinition[];
  fetchers?: readonly FetcherProvider<unknown>[];
  ruleGroups?: readonly AtomicRuleGroup[];
}): RuleWorkspaceScheduler;
