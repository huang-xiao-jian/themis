import { describe, expect, it, vi } from 'vitest';
import { FetcherType } from '../fetcher/FetcherType';
import type { PaginatedResult } from '../fetcher/PaginatedResult';
import { provideElementaryFetcher } from '../fetcher/provideElementaryFetcher';
import { provideFilterableFetcher } from '../fetcher/provideFilterableFetcher';
import { providePaginatedFetcher } from '../fetcher/providePaginatedFetcher';
import { providePaginatedFilterableFetcher } from '../fetcher/providePaginatedFilterableFetcher';

describe('provideElementaryFetcher', () => {
  it('returns a provider with type=elementary and no resourceName', () => {
    const fetch = vi.fn().mockResolvedValue([]);
    const provider = provideElementaryFetcher({ fetch });
    expect(provider.type).toBe(FetcherType.ELEMENTARY);
    expect('resourceName' in provider).toBe(false);
  });

  it('exposes fetcher that receives resourceName as first arg', async () => {
    const fetch = vi.fn().mockResolvedValue([{ label: '北京', value: 'bj' }]);
    const provider = provideElementaryFetcher({ fetch });
    const result = await provider.fetcher.fetch('City');
    expect(fetch).toHaveBeenCalledWith('City');
    expect(result).toEqual([{ label: '北京', value: 'bj' }]);
  });
});

describe('providePaginatedFetcher', () => {
  it('returns a provider with type=paginated and no resourceName', () => {
    const fetch = vi.fn().mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0 });
    const provider = providePaginatedFetcher({ fetch });
    expect(provider.type).toBe(FetcherType.PAGINATED);
    expect('resourceName' in provider).toBe(false);
  });

  it('invokes fetcher with resourceName, page and pageSize', async () => {
    const result: PaginatedResult<unknown> = {
      data: [],
      page: 2,
      pageSize: 10,
      total: 0,
    };
    const fetch = vi.fn().mockResolvedValue(result);
    const provider = providePaginatedFetcher({ fetch });
    const out = await provider.fetcher.fetch('City', 2, 10);
    expect(fetch).toHaveBeenCalledWith('City', 2, 10);
    expect(out).toBe(result);
  });
});

describe('provideFilterableFetcher', () => {
  it('returns a provider with type=filterable and no resourceName', () => {
    const fetch = vi.fn().mockResolvedValue([]);
    const provider = provideFilterableFetcher({ fetch });
    expect(provider.type).toBe(FetcherType.FILTERABLE);
    expect('resourceName' in provider).toBe(false);
  });

  it('invokes fetcher with resourceName and keyword', async () => {
    const fetch = vi.fn().mockResolvedValue([{ label: '张三', value: 'z3' }]);
    const provider = provideFilterableFetcher({ fetch });
    const out = await provider.fetcher.fetch('Employee', '张三');
    expect(fetch).toHaveBeenCalledWith('Employee', '张三');
    expect(out).toEqual([{ label: '张三', value: 'z3' }]);
  });
});

describe('providePaginatedFilterableFetcher', () => {
  it('returns a provider with type=paginatedFilterable and no resourceName', () => {
    const fetch = vi.fn().mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0 });
    const provider = providePaginatedFilterableFetcher({ fetch });
    expect(provider.type).toBe(FetcherType.PAGINATED_FILTERABLE);
    expect('resourceName' in provider).toBe(false);
  });

  it('invokes fetcher with resourceName, keyword, page and pageSize', async () => {
    const result: PaginatedResult<unknown> = {
      data: [],
      page: 1,
      pageSize: 20,
      total: 0,
    };
    const fetch = vi.fn().mockResolvedValue(result);
    const provider = providePaginatedFilterableFetcher({ fetch });
    const out = await provider.fetcher.fetch('Employee', '张三', 1, 20);
    expect(fetch).toHaveBeenCalledWith('Employee', '张三', 1, 20);
    expect(out).toBe(result);
  });
});
