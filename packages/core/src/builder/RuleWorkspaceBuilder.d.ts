import type { AtomicRuleGroup } from '../dsl/AtomicRule';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import type { FetcherProvider } from '../fetcher/FetcherProvider';
import { RuleWorkspaceScheduler } from '../scheduler/RuleWorkspaceScheduler';
/**
 * 链式 Builder
 *
 * 推荐在需要精细控制配置的场景使用
 */
export declare class RuleWorkspaceBuilder {
  private factors;
  private fetchers;
  private ruleGroups;
  withFactors(factors: readonly RuleFactorDefinition[]): this;
  withFetchers(fetchers: readonly FetcherProvider<unknown>[]): this;
  withRuleGroups(ruleGroups: readonly AtomicRuleGroup[]): this;
  build(): RuleWorkspaceScheduler;
}
