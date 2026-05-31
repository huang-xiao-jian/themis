import { signal } from 'alien-signals';
import type { IRuleWorkspaceScheduler, IAtomicRuleGroupScheduler } from '../types/Scheduler';
import type { AtomicRuleGroup, AtomicRuleGroupData } from '../types/Scheduler';
import type { RuleFactorDefinition } from '../types/DSL';
import type { FetcherProvider, FieldDataSource } from '../types/Fetcher';
import type { Resource } from '../types/Resource';
import { StaticResource } from '../resource/StaticResource';
import { ElementaryResource } from '../resource/ElementaryResource';
import { PaginatedResource } from '../resource/PaginatedResource';
import { FilterableResource } from '../resource/FilterableResource';
import { PaginatedFilterableResource } from '../resource/PaginatedFilterableResource';
import { AtomicRuleGroupScheduler } from './AtomicRuleGroupScheduler';

/**
 * 工作空间 Builder
 */
export class RuleWorkspaceBuilder {
  private _factors: RuleFactorDefinition[] = [];
  private _fetchers: FetcherProvider<FieldDataSource>[] = [];
  private _snapshot: AtomicRuleGroupData[] = [];

  /**
   * 添加规则因子定义
   */
  withFactors(factors: RuleFactorDefinition[]): this {
    this._factors = factors;
    return this;
  }

  /**
   * 添加 Fetcher
   */
  withFetchers(fetchers: readonly FetcherProvider[]): this {
    this._fetchers = [...fetchers] as FetcherProvider<FieldDataSource>[];
    return this;
  }

  /**
   * 添加已有规则组（编辑场景可选）
   */
  withRuleGroups(ruleGroups: readonly AtomicRuleGroupData[]): this {
    this._snapshot = [...ruleGroups];
    return this;
  }

  /**
   * 构建 RuleWorkspace 实例
   */
  build(): RuleWorkspaceScheduler {
    return new RuleWorkspaceScheduler(
      this._factors,
      this._fetchers,
      this._snapshot
    );
  }
}

/**
 * 工作空间设置器实现
 */
export class RuleWorkspaceScheduler implements IRuleWorkspaceScheduler {
  readonly snapshot: IRuleWorkspaceScheduler['snapshot'];
  readonly groups: IRuleWorkspaceScheduler['groups'];

  private readonly _factors: RuleFactorDefinition[];
  private readonly _groupsMap: Map<string, IAtomicRuleGroupScheduler>;
  private readonly _groups: ReturnType<typeof signal<readonly IAtomicRuleGroupScheduler[]>>;
  private readonly _resourceRegistry: Map<string, Resource>;

  constructor(
    factors: RuleFactorDefinition[],
    fetchers: readonly FetcherProvider<FieldDataSource>[],
    snapshot: readonly AtomicRuleGroupData[] = []
  ) {
    this._factors = factors;
    this._groupsMap = new Map();
    this._resourceRegistry = new Map();

    // 构建 Resource 注册表
    this._buildResourceRegistry(factors, fetchers);

    // 从 snapshot 恢复已有规则组
    if (snapshot.length > 0) {
      snapshot.forEach((group) => {
        const groupId = group.rules[0]?.id.split('-')[0] ?? crypto.randomUUID();
        const scheduler = this.addGroup(groupId);
        // 恢复每个原子规则
        group.rules.forEach((rule) => {
          scheduler.addRule(rule.id, {
            name: rule.name,
            operator: rule.operator,
            threshold: rule.threshold,
          });
        });
      });
    }

    // 初始化 Signal
    this._groups = signal<readonly IAtomicRuleGroupScheduler[]>([...this._groupsMap.values()]);
    this.groups = this._groups;
    this.snapshot = snapshot;
  }

  addGroup(groupId: string): IAtomicRuleGroupScheduler {
    const scheduler = new AtomicRuleGroupScheduler(
      groupId,
      this._factors,
      this._resourceRegistry
    );
    this._groupsMap.set(groupId, scheduler);
    this._groups([...this._groupsMap.values()]);
    return scheduler;
  }

  removeGroup(groupId: string): void {
    const scheduler = this._groupsMap.get(groupId);
    if (scheduler) {
      (scheduler as AtomicRuleGroupScheduler).dispose();
      this._groupsMap.delete(groupId);
      this._groups([...this._groupsMap.values()]);
    }
  }

  validate(): boolean {
    return [...this._groupsMap.values()].every((g) => g.validate());
  }

  build(): readonly AtomicRuleGroup[] {
    return [...this._groupsMap.values()].map((g) => g.build());
  }

  /**
   * 构建 Resource 注册表
   */
  private _buildResourceRegistry(
    factors: RuleFactorDefinition[],
    fetchers: readonly FetcherProvider<FieldDataSource>[]
  ): void {
    // 处理业务方提供的 Fetcher
    fetchers.forEach((fp) => {
      const resource = this._createResource(fp);
      this._resourceRegistry.set(fp.resourceName, resource);
    });

    // 为静态资源创建默认的 Resource（内核默认提供）
    factors.forEach((f) => {
      if (!f.resource) return;
      if (this._resourceRegistry.has(f.resource.name)) return;

      // 创建空选项的静态资源，业务方需通过 withFetchers 注入数据
      const staticResource = new StaticResource(f.resource.name, []);
      this._resourceRegistry.set(f.resource.name, staticResource);
    });
  }

  /**
   * 根据 FetcherProvider 创建 Resource
   */
  private _createResource(fp: FetcherProvider<FieldDataSource>): Resource {
    switch (fp.type) {
      case 'elementary':
        return new ElementaryResource(fp.resourceName, fp.fetcher as any);
      case 'paginated':
        return new PaginatedResource(fp.resourceName, fp.fetcher as any);
      case 'filterable':
        return new FilterableResource(fp.resourceName, fp.fetcher as any);
      case 'paginatedFilterable':
        return new PaginatedFilterableResource(fp.resourceName, fp.fetcher as any);
      case 'static':
        // 静态资源由内核默认提供，这里不会走到这个分支
        return new StaticResource(fp.resourceName, []);
      default:
        return new StaticResource(fp.resourceName, []);
    }
  }

  /**
   * 释放所有资源
   */
  dispose(): void {
    this._groupsMap.forEach((g) => (g as AtomicRuleGroupScheduler).dispose());
    this._groupsMap.clear();
  }
}