import { describe, expect, it, vi } from 'vitest';
import { ElementaryDynamicResourceImpl } from './ElementaryDynamicResourceImpl';

describe('ElementaryDynamicResourceImpl', () => {
  it('starts with loading=false and empty options', () => {
    const resource = new ElementaryDynamicResourceImpl('Foo', {
      fetch: vi.fn().mockResolvedValue([]),
    });
    expect(resource.loading.value).toBe(false);
    expect(resource.options.value).toEqual([]);
  });

  it('onRefresh flips loading and fills options', async () => {
    const fetch = vi.fn().mockResolvedValue([{ label: 'A', value: 'a' }]);
    const resource = new ElementaryDynamicResourceImpl('Foo', { fetch });

    resource.onRefresh();
    // 同步阶段 loading 已置为 true
    expect(resource.loading.value).toBe(true);
    await new Promise((r) => setTimeout(r, 0));
    expect(resource.loading.value).toBe(false);
    expect(resource.options.value).toEqual([{ label: 'A', value: 'a' }]);
    // resourceName 作为请求参数透传给 fetcher
    expect(fetch).toHaveBeenCalledWith('Foo');
  });

  it('onRefresh resets loading even when fetch rejects', async () => {
    const fetch = vi.fn().mockRejectedValue(new Error('boom'));
    const resource = new ElementaryDynamicResourceImpl('Foo', { fetch });

    resource.onRefresh();
    expect(resource.loading.value).toBe(true);
    await new Promise((r) => setTimeout(r, 0));
    expect(resource.loading.value).toBe(false);
  });

  it('onFiltrate filters options locally', async () => {
    const fetch = vi.fn().mockResolvedValue([
      { label: '北京', value: 'bj' },
      { label: '上海', value: 'sh' },
    ]);
    const resource = new ElementaryDynamicResourceImpl('City', { fetch });
    resource.onRefresh();
    await new Promise((r) => setTimeout(r, 0));
    resource.onFiltrate('bj');
    expect(resource.options.value).toEqual([{ label: '北京', value: 'bj' }]);
  });
});
