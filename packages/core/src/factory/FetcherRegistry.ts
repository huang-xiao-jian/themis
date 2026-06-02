import type { FetcherProvider } from '../fetcher/FetcherProvider'

/**
 * Fetcher Registry
 *
 * 集中管理 FetcherProvider，提供按 resourceName 注册 / 查询的能力
 */
export class FetcherRegistry {
  private readonly map: Map<string, FetcherProvider<unknown>> = new Map()

  /**
   * 注册一个 FetcherProvider
   * 同一 resourceName 后注册者覆盖前注册者
   */
  register(provider: FetcherProvider<unknown>): void {
    this.map.set(provider.resourceName, provider)
  }

  /**
   * 按资源名称查询
   */
  get(name: string): FetcherProvider<unknown> | undefined {
    return this.map.get(name)
  }

  /**
   * 是否注册了指定资源
   */
  has(name: string): boolean {
    return this.map.has(name)
  }

  /**
   * 获取所有已注册的 FetcherProvider
   */
  all(): readonly FetcherProvider<unknown>[] {
    return Array.from(this.map.values())
  }
}
