import type { DynamicRuleFactorResource } from '../dsl/DynamicRuleFactorResource';
import type { FieldDataSource } from '../dsl/FieldDataSource';
import type { DynamicResource } from '../resource/DynamicResource';
import type { FetcherRegistry } from './FetcherRegistry';
/**
 * 动态资源工厂抽象类
 */
export declare abstract class DynamicResourceFactory {
  abstract create(resource: DynamicRuleFactorResource): DynamicResource<FieldDataSource>;
}
/**
 * 默认动态资源工厂实现
 *
 * - 无 features：fallback 到 ElementaryDynamicResource（最基础动态资源）
 * - 仅 pagination：PaginatedDynamicResource
 * - 仅 filter：FilterableDynamicResource
 * - pagination + filter：PaginatedFilterableDynamicResource
 *
 * 按 type 从 FetcherRegistry 中查找 FetcherProvider（精确匹配，不做 fallback）：
 *   - paginated + filter：paginatedFilterable
 *   - 仅 pagination：paginated
 *   - 仅 filter：filterable
 *   - 无 features：elementary
 * 找不到对应类型的 FetcherProvider 时抛错
 */
export declare class DefaultDynamicResourceFactory extends DynamicResourceFactory {
  private readonly registry;
  constructor(registry: FetcherRegistry);
  create(resource: DynamicRuleFactorResource): DynamicResource<FieldDataSource>;
}
