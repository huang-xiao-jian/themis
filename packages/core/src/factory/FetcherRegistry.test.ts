import { describe, expect, it } from 'vitest'
import { FetcherRegistry } from './FetcherRegistry'
import { provideElementaryFetcher } from '../fetcher/provideElementaryFetcher'
import { providePaginatedFetcher } from '../fetcher/providePaginatedFetcher'

describe('FetcherRegistry', () => {
  it('returns undefined for unregistered type', () => {
    const registry = new FetcherRegistry()
    expect(registry.find('elementary')).toBeUndefined()
  })

  it('register and find returns the same provider', () => {
    const registry = new FetcherRegistry()
    const provider = provideElementaryFetcher<unknown>({ fetch: () => Promise.resolve([]) })
    registry.register(provider)
    expect(registry.find('elementary')).toBe(provider)
  })

  it('find returns the first provider matching the type', () => {
    const registry = new FetcherRegistry()
    const first = provideElementaryFetcher<unknown>({ fetch: () => Promise.resolve([]) })
    const second = provideElementaryFetcher<unknown>({ fetch: () => Promise.resolve([]) })
    registry.register(first)
    registry.register(second)
    expect(registry.find('elementary')).toBe(first)
    expect(registry.all()).toHaveLength(2)
  })

  it('all() returns all registered providers in insertion order', () => {
    const registry = new FetcherRegistry()
    const a = provideElementaryFetcher<unknown>({ fetch: () => Promise.resolve([]) })
    const b = providePaginatedFetcher<unknown>({
      fetch: () => Promise.resolve({ data: [], page: 1, pageSize: 20, total: 0 }),
    })
    registry.register(a)
    registry.register(b)
    expect(registry.all()).toHaveLength(2)
    expect(registry.all()[0]).toBe(a)
    expect(registry.all()[1]).toBe(b)
  })
})
