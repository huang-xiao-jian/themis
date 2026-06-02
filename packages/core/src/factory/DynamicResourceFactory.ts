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
 * 注册表中查不到对应 Fetcher 时抛错
 */
export class DefaultDynamicResourceFactory extends DynamicResourceFactory {
  constructor(private readonly registry: FetcherRegistry) {
    super()
  }

  override create(resource: DynamicRuleFactorResource): DynamicResource<FieldDataSource> {
    const features = new Set(resource.features ?? [])
    const provider = this.registry.get(resource.name)
    if (!provider) {
      throw new Error(
        `[sisyphus] No FetcherProvider registered for resource "${resource.name}". ` +
          `Register a provider via FetcherRegistry.register() before creating the resource.`
      )
    }

    const hasPagination = features.has('pagination')
    const hasFilter = features.has('filter')

    if (hasPagination && hasFilter) {
      if (provider.type !== 'paginatedFilterable') {
        throw new Error(
          `[sisyphus] Resource "${resource.name}" declared features [pagination, filter] ` +
            `but registered provider type is "${provider.type}".`
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
      if (provider.type !== 'paginated' && provider.type !== 'paginatedFilterable') {
        throw new Error(
          `[sisyphus] Resource "${resource.name}" declared feature [pagination] ` +
            `but registered provider type is "${provider.type}".`
        )
      }
      const fetcher = (provider as { fetcher: PaginatedFetcher<FieldDataSource> }).fetcher
      return new PaginatedDynamicResourceImpl<FieldDataSource>(resource.name, fetcher)
    }

    if (hasFilter) {
      if (provider.type !== 'filterable' && provider.type !== 'paginatedFilterable') {
        throw new Error(
          `[sisyphus] Resource "${resource.name}" declared feature [filter] ` +
            `but registered provider type is "${provider.type}".`
        )
      }
      const fetcher = (provider as { fetcher: FilterableFetcher<FieldDataSource> }).fetcher
      return new FilterableDynamicResourceImpl<FieldDataSource>(resource.name, fetcher)
    }

    // 无 features：fallback 到 Elementary（最基础动态资源）
    if (provider.type !== 'elementary') {
      throw new Error(
        `[sisyphus] Resource "${resource.name}" declared no features but registered ` +
          `provider type is "${provider.type}". Use provideElementaryFetcher() or declare features.`
      )
    }
    const fetcher = (provider as { fetcher: ElementaryFetcher<FieldDataSource> }).fetcher
    return new ElementaryDynamicResourceImpl<FieldDataSource>(resource.name, fetcher)
  }
}
