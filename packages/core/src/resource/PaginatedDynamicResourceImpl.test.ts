import { describe, expect, it, vi } from 'vitest';
import type { PaginatedResult } from '../fetcher/PaginatedResult';
import { PaginatedDynamicResourceImpl } from './PaginatedDynamicResourceImpl';

describe('PaginatedDynamicResourceImpl', () => {
  it('starts with page=1 and empty options', () => {
    const resource = new PaginatedDynamicResourceImpl('Foo', {
      fetch: vi.fn().mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0 }),
    });
    expect(resource.pagination.value.page).toBe(1);
    expect(resource.pagination.value.pageSize).toBe(20);
    expect(resource.options.value).toEqual([]);
  });

  it('onRefresh loads first page', async () => {
    const result: PaginatedResult<unknown> = {
      data: [{ label: 'A', value: 'a' }],
      page: 1,
      pageSize: 20,
      total: 100,
    };
    const fetch = vi.fn().mockResolvedValue(result);
    const resource = new PaginatedDynamicResourceImpl('Foo', { fetch });
    resource.onRefresh();
    await new Promise((r) => setTimeout(r, 0));
    expect(resource.options.value).toEqual([{ label: 'A', value: 'a' }]);
    expect(resource.pagination.value.total).toBe(100);
  });

  it('onFlip updates page and re-fetches', async () => {
    const fetch = vi
      .fn()
      .mockImplementation((_name: string, page: number): Promise<PaginatedResult<unknown>> => {
        return Promise.resolve({ data: [{ page }], page, pageSize: 20, total: 100 });
      });
    const resource = new PaginatedDynamicResourceImpl('Foo', { fetch });
    resource.onRefresh();
    await new Promise((r) => setTimeout(r, 0));
    resource.onFlip(3);
    await new Promise((r) => setTimeout(r, 0));
    expect(resource.pagination.value.page).toBe(3);
    // resourceName 作为请求参数透传给 fetcher
    expect(fetch).toHaveBeenLastCalledWith('Foo', 3, 20);
  });

  it('exposes loading flag that flips around fetch', async () => {
    const resource = new PaginatedDynamicResourceImpl('Foo', {
      fetch: vi.fn().mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0 }),
    });
    resource.onRefresh();
    expect(resource.loading.value).toBe(true);
    await new Promise((r) => setTimeout(r, 0));
    expect(resource.loading.value).toBe(false);
  });
});
