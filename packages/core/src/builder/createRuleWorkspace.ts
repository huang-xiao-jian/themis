import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition'
import type { AtomicRuleGroup } from '../dsl/AtomicRule'
import type { FetcherProvider } from '../fetcher/FetcherProvider'
import { RuleWorkspaceScheduler } from '../scheduler/RuleWorkspaceScheduler'
import { RuleWorkspaceBuilder } from './RuleWorkspaceBuilder'

/**
 * 简化工厂函数 - 一站式创建工作空间
 *
 * 适合简单场景；推荐新手使用
 */
export function createRuleWorkspace(config: {
  factors: readonly RuleFactorDefinition[]
  fetchers?: readonly FetcherProvider<unknown>[]
  ruleGroups?: readonly AtomicRuleGroup[]
}): RuleWorkspaceScheduler {
  const builder = new RuleWorkspaceBuilder().withFactors(config.factors)
  if (config.fetchers) {
    builder.withFetchers(config.fetchers)
  }
  if (config.ruleGroups) {
    builder.withRuleGroups(config.ruleGroups)
  }
  return builder.build()
}
