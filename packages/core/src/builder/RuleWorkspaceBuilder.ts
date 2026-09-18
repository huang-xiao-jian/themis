import type { AtomicRuleGroup } from '../dsl/AtomicRule';
import type { RuleFactor } from '../dsl/RuleFactor';
import { DefaultDynamicResourceFactory } from '../factory/DynamicResourceFactory';
import { FetcherRegistry } from '../factory/FetcherRegistry';
import { DefaultResourceFactory } from '../factory/ResourceFactory';
import { DefaultStaticResourceFactory } from '../factory/StaticResourceFactory';
import type { FetcherProvider } from '../fetcher/FetcherProvider';
import { FactorInferrer } from '../inferrer/FactorInferrer';
import { OperatorInferrer } from '../inferrer/OperatorInferrer';
import { ThresholderInferrer } from '../inferrer/ThresholderInferrer';
import { RuleWorkspaceScheduler } from '../scheduler/RuleWorkspaceScheduler';

/**
 * 链式 Builder
 *
 * 推荐在需要精细控制配置的场景使用
 */
export class RuleWorkspaceBuilder {
  private factors: readonly RuleFactor[] = [];
  private fetchers: readonly FetcherProvider<unknown>[] = [];
  private ruleGroups: readonly AtomicRuleGroup[] | undefined;

  withFactors(factors: readonly RuleFactor[]): this {
    this.factors = factors;
    return this;
  }

  withFetchers(fetchers: readonly FetcherProvider<unknown>[]): this {
    this.fetchers = fetchers;
    return this;
  }

  withRuleGroups(ruleGroups: readonly AtomicRuleGroup[]): this {
    this.ruleGroups = ruleGroups;
    return this;
  }

  build(): RuleWorkspaceScheduler {
    const registry = new FetcherRegistry();
    for (const fetcher of this.fetchers) {
      registry.register(fetcher);
    }
    const resourceFactory = new DefaultResourceFactory(
      new DefaultStaticResourceFactory(),
      new DefaultDynamicResourceFactory(registry)
    );
    const thresholder = new ThresholderInferrer(resourceFactory);
    const operator = new OperatorInferrer();
    const factor = new FactorInferrer(this.factors);
    return new RuleWorkspaceScheduler(
      this.factors,
      { factor, operator, thresholder },
      this.ruleGroups
    );
  }
}
