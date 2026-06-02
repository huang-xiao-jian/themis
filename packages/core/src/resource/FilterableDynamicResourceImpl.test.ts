import { describe, expect, it, vi } from 'vitest';
import { FilterableDynamicResourceImpl } from './FilterableDynamicResourceImpl';

describe('FilterableDynamicResourceImpl', () => {
  it('onFilter invokes fetcher with the resourceName and keyword', async () => {
    const fetch = vi.fn().mockResolvedValue([{ label: 'A', value: 'a' }]);
    const resource = new FilterableDynamicResourceImpl('Foo', { fetch });
    resource.onFilter('hello');
    await new Promise((r) => setTimeout(r, 0));
    // resourceName 作为请求参数透传给 fetcher
    expect(fetch).toHaveBeenCalledWith('Foo', 'hello');
    expect(resource.options.value).toEqual([{ label: 'A', value: 'a' }]);
  });

  it('onRefresh re-fetches with the latest keyword', async () => {
    const fetch = vi.fn().mockResolvedValue([]);
    const resource = new FilterableDynamicResourceImpl('Foo', { fetch });
    resource.onFilter('a');
    await new Promise((r) => setTimeout(r, 0));
    resource.onRefresh();
    await new Promise((r) => setTimeout(r, 0));
    expect(fetch).toHaveBeenNthCalledWith(1, 'Foo', 'a');
    expect(fetch).toHaveBeenNthCalledWith(2, 'Foo', 'a');
  });

  it('loading toggles around fetch', async () => {
    const resource = new FilterableDynamicResourceImpl('Foo', {
      fetch: vi.fn().mockResolvedValue([]),
    });
    resource.onFilter('x');
    expect(resource.loading.value).toBe(true);
    await new Promise((r) => setTimeout(r, 0));
    expect(resource.loading.value).toBe(false);
  });
});
