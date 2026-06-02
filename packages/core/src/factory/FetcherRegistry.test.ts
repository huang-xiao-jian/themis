import { describe, expect, it } from 'vitest'
import { FetcherRegistry } from './FetcherRegistry'
import { provideElementaryFetcher } from '../fetcher/provideElementaryFetcher'
import { providePaginatedFetcher } from '../fetcher/providePaginatedFetcher'

describe('FetcherRegistry', () => {
  it('returns undefined for unregistered resource', () => {
    const registry = new FetcherRegistry()
    expect(registry.get('City')).toBeUndefined()
    expect(registry.has('City')).toBe(false)
  })

  it('register and get returns the same provider', () => {
    const registry = new FetcherRegistry()
    const provider = provideElementaryFetcher<unknown>('City', { fetch: () => Promise.resolve([]) })
    registry.register(provider)
    expect(registry.get('City')).toBe(provider)
    expect(registry.has('City')).toBe(true)
  })

  it('later registration overrides earlier one with same name', () => {
    const registry = new FetcherRegistry()
    const first = provideElementaryFetcher<unknown>('City', { fetch: () => Promise.resolve([]) })
    const second = providePaginatedFetcher<unknown>('City', {
      fetch: () => Promise.resolve({ data: [], page: 1, pageSize: 20, total: 0 }),
    })
    registry.register(first)
    registry.register(second)
    expect(registry.get('City')).toBe(second)
    expect(registry.all()).toHaveLength(1)
  })

  it('all() returns all registered providers', () => {
    const registry = new FetcherRegistry()
    registry.register(provideElementaryFetcher<unknown>('A', { fetch: () => Promise.resolve([]) }))
    registry.register(provideElementaryFetcher<unknown>('B', { fetch: () => Promise.resolve([]) }))
    expect(registry.all()).toHaveLength(2)
  })
})
