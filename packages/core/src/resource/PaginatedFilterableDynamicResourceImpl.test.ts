import { describe, expect, it, vi } from 'vitest'
import { PaginatedFilterableDynamicResourceImpl } from './PaginatedFilterableDynamicResourceImpl'
import type { PaginatedResult } from '../fetcher/PaginatedResult'

describe('PaginatedFilterableDynamicResourceImpl', () => {
  it('starts with empty keyword and page=1', () => {
    const resource = new PaginatedFilterableDynamicResourceImpl('Foo', {
      fetch: vi.fn().mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0 }),
    })
    expect(resource.keyword.value).toBe('')
    expect(resource.pagination.value.page).toBe(1)
  })

  it('onFilter updates keyword and resets to page=1', async () => {
    const fetch = vi
      .fn()
      .mockImplementation((_kw: string, page: number): Promise<PaginatedResult<unknown>> => {
        return Promise.resolve({ data: [], page, pageSize: 20, total: 0 })
      })
    const resource = new PaginatedFilterableDynamicResourceImpl('Foo', { fetch })
    // 模拟翻到第 3 页
    resource.onFlip(3)
    await new Promise((r) => setTimeout(r, 0))
    resource.onFilter('hello')
    await new Promise((r) => setTimeout(r, 0))
    expect(resource.keyword.value).toBe('hello')
    expect(resource.pagination.value.page).toBe(1)
  })

  it('onFlip keeps keyword unchanged', async () => {
    const fetch = vi
      .fn()
      .mockImplementation(
        (_kw: string, page: number, _size: number): Promise<PaginatedResult<unknown>> => {
          return Promise.resolve({ data: [], page, pageSize: 20, total: 0 })
        }
      )
    const resource = new PaginatedFilterableDynamicResourceImpl('Foo', { fetch })
    resource.onFilter('hello')
    await new Promise((r) => setTimeout(r, 0))
    resource.onFlip(2)
    await new Promise((r) => setTimeout(r, 0))
    expect(resource.keyword.value).toBe('hello')
    expect(resource.pagination.value.page).toBe(2)
  })

  it('passes keyword, page and pageSize to fetcher', async () => {
    const fetch = vi.fn().mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0 })
    const resource = new PaginatedFilterableDynamicResourceImpl('Foo', { fetch })
    resource.onFilter('hello')
    await new Promise((r) => setTimeout(r, 0))
    expect(fetch).toHaveBeenCalledWith('hello', 1, 20)
  })
})
