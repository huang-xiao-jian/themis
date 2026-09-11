import type { FieldDataSource } from '../dsl/FieldDataSource';
import type { StaticRuleFactorResource } from '../dsl/StaticRuleFactorResource';
import type { StaticResource } from '../resource/StaticResource';
/**
 * 静态资源工厂抽象类
 */
export declare abstract class StaticResourceFactory {
  abstract create(resource: StaticRuleFactorResource): StaticResource<FieldDataSource>;
}
/**
 * 默认静态资源工厂实现
 */
export declare class DefaultStaticResourceFactory extends StaticResourceFactory {
  create(resource: StaticRuleFactorResource): StaticResource<FieldDataSource>;
}
