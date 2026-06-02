import type { FieldDataSource } from '../dsl/FieldDataSource';
import type { StaticRuleFactorResource } from '../dsl/StaticRuleFactorResource';
import type { StaticResource } from '../resource/StaticResource';
import { StaticResourceImpl } from '../resource/StaticResourceImpl';

/**
 * 静态资源工厂抽象类
 */
export abstract class StaticResourceFactory {
  abstract create(resource: StaticRuleFactorResource): StaticResource<FieldDataSource>;
}

/**
 * 默认静态资源工厂实现
 */
export class DefaultStaticResourceFactory extends StaticResourceFactory {
  override create(resource: StaticRuleFactorResource): StaticResource<FieldDataSource> {
    return new StaticResourceImpl<FieldDataSource>(resource.name, resource.options);
  }
}
