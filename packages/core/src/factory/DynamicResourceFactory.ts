import type { FieldDataSource } from '../dsl/FieldDataSource'
import type { DynamicRuleFactorResource } from '../dsl/DynamicRuleFactorResource'
import type { DynamicResource } from '../resource/DynamicResource'
import { ElementaryDynamicResourceImpl } from '../resource/ElementaryDynamicResourceImpl'
import { PaginatedDynamicResourceImpl } from '../resource/PaginatedDynamicResourceImpl'
import { FilterableDynamicResourceImpl } from '../resource/FilterableDynamicResourceImpl'
import { PaginatedFilterableDynamicResourceImpl } from '../resource/PaginatedFilterableDynamicResourceImpl'
import type { ElementaryFetcher } from '../fetcher/ElementaryFetcher'
import type { PaginatedFetcher } from '../fetcher/PaginatedFetcher'
import type { FilterableFetcher } from '../fetcher/FilterableFetcher'
import type { PaginatedFilterableFetcher } from '../fetcher/PaginatedFilterableFetcher'
import type { FetcherRegistry } from './FetcherRegistry'

/**
 * 动态资源工厂抽象类
 */
export abstract class DynamicResourceFactory {
  abstract create(resource: DynamicRuleFactorResource): DynamicResource<FieldDataSource>
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
export class DefaultDynamicResourceFactory extends DynamicResourceFactory {
  constructor(private readonly registry: FetcherRegistry) {
    super()
  }

  override create(resource: DynamicRuleFactorResource): DynamicResource<FieldDataSource> {
    const features = new Set(resource.features ?? [])
    const hasPagination = features.has('pagination')
    const hasFilter = features.has('filter')

    if (hasPagination && hasFilter) {
      // 必须注册 paginatedFilterable
      const provider = this.registry.find('paginatedFilterable')
      if (!provider) {
        throw new Error(
          `[sisyphus] No FetcherProvider with type "paginatedFilterable" registered. ` +
            `Resource "${resource.name}" requires a PaginatedFilterableFetcher.`
        )
      }
      const fetcher = (provider as { fetcher: PaginatedFilterableFetcher<FieldDataSource> })
        .fetcher
      return new PaginatedFilterableDynamicResourceImpl<FieldDataSource>(
        resource.name,
        fetcher
      )
    }

    if (hasPagination) {
      // 精确匹配 paginated；不做 fallback
      const provider = this.registry.find('paginated')
      if (!provider) {
        throw new Error(
          `[sisyphus] No FetcherProvider with type "paginated" registered. ` +
            `Resource "${resource.name}" requires a PaginatedFetcher.`
        )
      }
      const fetcher = (provider as { fetcher: PaginatedFetcher<FieldDataSource> }).fetcher
      return new PaginatedDynamicResourceImpl<FieldDataSource>(resource.name, fetcher)
    }

    if (hasFilter) {
      // 精确匹配 filterable；不做 fallback
      const provider = this.registry.find('filterable')
      if (!provider) {
        throw new Error(
          `[sisyphus] No FetcherProvider with type "filterable" registered. ` +
            `Resource "${resource.name}" requires a FilterableFetcher.`
        )
      }
      const fetcher = (provider as { fetcher: FilterableFetcher<FieldDataSource> }).fetcher
      return new FilterableDynamicResourceImpl<FieldDataSource>(resource.name, fetcher)
    }

    // 无 features：fallback 到 Elementary（最基础动态资源）
    const provider = this.registry.find('elementary')
    if (!provider) {
      throw new Error(
        `[sisyphus] No FetcherProvider with type "elementary" registered. ` +
          `Resource "${resource.name}" requires an elementary fetcher, or declare features.`
      )
    }
    const fetcher = (provider as { fetcher: ElementaryFetcher<FieldDataSource> }).fetcher
    return new ElementaryDynamicResourceImpl<FieldDataSource>(resource.name, fetcher)
  }
}
