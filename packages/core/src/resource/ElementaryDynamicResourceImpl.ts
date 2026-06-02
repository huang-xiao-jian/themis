import { signal, type Signal } from '@preact/signals-core'
import type { ElementaryFetcher } from '../fetcher/ElementaryFetcher'
import type { ElementaryDynamicResource } from './DynamicResource'

/**
 * 基础动态资源实现
 *
 * onRefresh 触发 fetch，loading 状态在 fetch 前后切换；错误时 loading 仍需重置
 */
export class ElementaryDynamicResourceImpl<T> implements ElementaryDynamicResource<T> {
  readonly name: string
  readonly loading: Signal<boolean>
  readonly options: Signal<readonly T[]>
  private readonly fetcher: ElementaryFetcher<T>

  constructor(name: string, fetcher: ElementaryFetcher<T>) {
    this.name = name
    this.fetcher = fetcher
    this.loading = signal(false)
    this.options = signal<readonly T[]>([])
  }

  onRefresh = (): void => {
    this.loading.value = true
    this.fetcher
      .fetch(this.name)
      .then((data) => {
        this.options.value = [...data]
      })
      .catch(() => {
        // 错误时清空选项，loading 在 finally 中重置
      })
      .finally(() => {
        this.loading.value = false
      })
  }

  onFiltrate = (value: string | number): void => {
    const filtered = this.options.value.filter(
      (opt) => (opt as { value: string | number }).value === value
    )
    this.options.value = filtered
  }
}
