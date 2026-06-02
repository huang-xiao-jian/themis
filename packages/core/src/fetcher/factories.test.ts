import { describe, expect, it, vi } from 'vitest'
import { provideElementaryFetcher } from '../fetcher/provideElementaryFetcher'
import { providePaginatedFetcher } from '../fetcher/providePaginatedFetcher'
import { provideFilterableFetcher } from '../fetcher/provideFilterableFetcher'
import { providePaginatedFilterableFetcher } from '../fetcher/providePaginatedFilterableFetcher'
import type { PaginatedResult } from '../fetcher/PaginatedResult'

describe('provideElementaryFetcher', () => {
  it('returns a provider with type=elementary and resourceName', () => {
    const fetch = vi.fn().mockResolvedValue([])
    const provider = provideElementaryFetcher('City', { fetch })
    expect(provider.type).toBe('elementary')
    expect(provider.resourceName).toBe('City')
  })

  it('exposes fetcher that can be invoked', async () => {
    const fetch = vi.fn().mockResolvedValue([{ label: '北京', value: 'bj' }])
    const provider = provideElementaryFetcher('City', { fetch })
    const result = await provider.fetcher.fetch()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(result).toEqual([{ label: '北京', value: 'bj' }])
  })
})

describe('providePaginatedFetcher', () => {
  it('returns a provider with type=paginated', () => {
    const fetch = vi.fn().mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0 })
    const provider = providePaginatedFetcher('City', { fetch })
    expect(provider.type).toBe('paginated')
    expect(provider.resourceName).toBe('City')
  })

  it('invokes fetcher with page and pageSize', async () => {
    const result: PaginatedResult<unknown> = {
      data: [],
      page: 2,
      pageSize: 10,
      total: 0,
    }
    const fetch = vi.fn().mockResolvedValue(result)
    const provider = providePaginatedFetcher('City', { fetch })
    const out = await provider.fetcher.fetch(2, 10)
    expect(fetch).toHaveBeenCalledWith(2, 10)
    expect(out).toBe(result)
  })
})

describe('provideFilterableFetcher', () => {
  it('returns a provider with type=filterable', () => {
    const fetch = vi.fn().mockResolvedValue([])
    const provider = provideFilterableFetcher('Employee', { fetch })
    expect(provider.type).toBe('filterable')
    expect(provider.resourceName).toBe('Employee')
  })

  it('invokes fetcher with keyword', async () => {
    const fetch = vi.fn().mockResolvedValue([{ label: '张三', value: 'z3' }])
    const provider = provideFilterableFetcher('Employee', { fetch })
    const out = await provider.fetcher.fetch('张三')
    expect(fetch).toHaveBeenCalledWith('张三')
    expect(out).toEqual([{ label: '张三', value: 'z3' }])
  })
})

describe('providePaginatedFilterableFetcher', () => {
  it('returns a provider with type=paginatedFilterable', () => {
    const fetch = vi.fn().mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0 })
    const provider = providePaginatedFilterableFetcher('Employee', { fetch })
    expect(provider.type).toBe('paginatedFilterable')
    expect(provider.resourceName).toBe('Employee')
  })

  it('invokes fetcher with keyword, page and pageSize', async () => {
    const result: PaginatedResult<unknown> = {
      data: [],
      page: 1,
      pageSize: 20,
      total: 0,
    }
    const fetch = vi.fn().mockResolvedValue(result)
    const provider = providePaginatedFilterableFetcher('Employee', { fetch })
    const out = await provider.fetcher.fetch('张三', 1, 20)
    expect(fetch).toHaveBeenCalledWith('张三', 1, 20)
    expect(out).toBe(result)
  })
})
