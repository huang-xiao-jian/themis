import type { DynamicRuleFactorResource } from '../dsl/DynamicRuleFactorResource';
import type { FieldDataSource } from '../dsl/FieldDataSource';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import type { StaticRuleFactorResource } from '../dsl/StaticRuleFactorResource';
import type { DynamicResource } from '../resource/DynamicResource';
import type { StaticResource } from '../resource/StaticResource';
import type { DynamicResourceFactory } from './DynamicResourceFactory';
import type { StaticResourceFactory } from './StaticResourceFactory';

/**
 * 运行时 Resource 联合类型（便于 Facade 统一返回）
 */
export type Resource = StaticResource<FieldDataSource> | DynamicResource<FieldDataSource>;

/**
 * 统一资源工厂抽象类
 */
export abstract class ResourceFactory {
  /**
   * 根据 factor 创建资源
   * - factor.resource 缺失：返回 null
   * - 含 options：创建静态资源
   * - 否则：创建动态资源（features / Fetcher 异常由内部工厂抛错）
   */
  abstract create(factor: RuleFactorDefinition): Resource | null;
}

/**
 * 默认 ResourceFactory 实现
 */
export class DefaultResourceFactory extends ResourceFactory {
  constructor(
    private readonly staticFactory: StaticResourceFactory,
    private readonly dynamicFactory: DynamicResourceFactory
  ) {
    super();
  }

  override create(factor: RuleFactorDefinition): Resource | null {
    if (!factor.resource) {
      return null;
    }

    // 静态资源判定：包含 options 字段
    if ('options' in factor.resource) {
      const staticResource: StaticRuleFactorResource = {
        name: factor.resource.name,
        options: factor.resource.options,
      };
      return this.staticFactory.create(staticResource);
    }

    // 动态资源
    const dynamicResource: DynamicRuleFactorResource = {
      name: factor.resource.name,
      features: factor.resource.features,
    };
    return this.dynamicFactory.create(dynamicResource);
  }
}
