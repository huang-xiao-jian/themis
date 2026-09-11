import type { FetcherProvider } from '../fetcher/FetcherProvider';
import { FetcherType } from '../fetcher/FetcherType';
/**
 * Fetcher Registry
 *
 * 职责：按 features 决定亚型时，查找匹配的 Fetcher。
 * Fetcher 与具体资源名称解耦，多个 Resource 可复用同一个 Fetcher
 */
export declare class FetcherRegistry {
  private readonly list;
  /**
   * 注册一个 FetcherProvider
   */
  register(provider: FetcherProvider<unknown>): void;
  /**
   * 查找首个匹配指定 type 的 Fetcher
   * @param type FetcherProvider 类型，与 features 组合决定亚型
   * @returns 匹配的 FetcherProvider，未找到返回 undefined
   */
  find(type: FetcherType): FetcherProvider<unknown> | undefined;
  /**
   * 获取全部 Provider
   */
  all(): readonly FetcherProvider<unknown>[];
}
