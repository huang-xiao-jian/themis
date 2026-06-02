import { describe, expect, it, vi } from 'vitest'
import { DefaultResourceFactory } from './ResourceFactory'
import { DefaultStaticResourceFactory } from './StaticResourceFactory'
import { DefaultDynamicResourceFactory } from './DynamicResourceFactory'
import { FetcherRegistry } from './FetcherRegistry'
import { DataType } from '../dsl/DataType'
import {
  booleanFactor,
  dynamicResourceFactor,
  staticResourceFactor,
} from '../__fixtures__/factors'
import { provideElementaryFetcher } from '../fetcher/provideElementaryFetcher'
import { providePaginatedFilterableFetcher } from '../fetcher/providePaginatedFilterableFetcher'
import type { DynamicResource } from '../resource/DynamicResource'
import type { ElementaryDynamicResource } from '../resource/DynamicResource'
import type { PaginatedFilterableDynamicResource } from '../resource/DynamicResource'

function makeFactory(withRegistry: FetcherRegistry = new FetcherRegistry()) {
  return new DefaultResourceFactory(
    new DefaultStaticResourceFactory(),
    new DefaultDynamicResourceFactory(withRegistry)
  )
}

describe('DefaultResourceFactory', () => {
  it('returns null when factor has no resource', () => {
    const factory = makeFactory()
    expect(factory.create(booleanFactor)).toBeNull()
  })

  it('creates StaticResource when factor.resource has options', () => {
    const factory = makeFactory()
    const resource = factory.create(staticResourceFactor)
    expect(resource).not.toBeNull()
    expect(resource!.name).toBe('City')
    // StaticResource 接口
    expect('options' in resource!).toBe(true)
    if (resource && 'options' in resource) {
      expect(resource.options.value).toHaveLength(2)
    }
  })

  it('creates ElementaryDynamicResource when features is empty array', () => {
    const registry = new FetcherRegistry()
    registry.register(provideElementaryFetcher<unknown>({ fetch: vi.fn().mockResolvedValue([]) }))
    const factory = makeFactory(registry)
    const resource = factory.create({
      name: 'foo',
      title: 'Foo',
      dataType: DataType.STRING,
      resource: { name: 'Foo' },
    }) as DynamicResource<unknown>
    expect(resource).not.toBeNull()
    expect('onRefresh' in resource && 'onFiltrate' in resource).toBe(true)
    // 没有 pagination/keyword 等字段
    expect('pagination' in resource).toBe(false)
  })

  it('creates PaginatedFilterableDynamicResource when features=[pagination, filter]', () => {
    const registry = new FetcherRegistry()
    registry.register(
      providePaginatedFilterableFetcher<unknown>({
        fetch: vi.fn().mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0 }),
      })
    )
    const factory = makeFactory(registry)
    const resource = factory.create(dynamicResourceFactor) as PaginatedFilterableDynamicResource<unknown>
    expect(resource).not.toBeNull()
    expect('pagination' in resource).toBe(true)
    expect('keyword' in resource).toBe(true)
  })

  it('throws when no Fetcher registered for dynamic resource', () => {
    const registry = new FetcherRegistry()
    const factory = makeFactory(registry)
    expect(() => factory.create(dynamicResourceFactor)).toThrow(/paginatedFilterable/)
  })

  it('throws when feature mismatch with provider type', () => {
    const registry = new FetcherRegistry()
    registry.register(provideElementaryFetcher<unknown>({ fetch: vi.fn().mockResolvedValue([]) }))
    const factory = makeFactory(registry)
    // dynamic resource 需要 paginatedFilterable，注册的是 elementary → 报 paginatedFilterable 缺失
    expect(() => factory.create(dynamicResourceFactor)).toThrow(/paginatedFilterable/)
  })
})
