import { signal, type Signal } from '@preact/signals-core'
import type { FilterableFetcher } from '../fetcher/FilterableFetcher'
import type { FilterableDynamicResource } from './DynamicResource'

/**
 * 过滤型动态资源实现
 */
export class FilterableDynamicResourceImpl<T> implements FilterableDynamicResource<T> {
  readonly name: string
  readonly loading: Signal<boolean>
  readonly options: Signal<readonly T[]>
  private readonly fetcher: FilterableFetcher<T>
  private currentKeyword: string

  constructor(name: string, fetcher: FilterableFetcher<T>) {
    this.name = name
    this.fetcher = fetcher
    this.currentKeyword = ''
    this.loading = signal(false)
    this.options = signal<readonly T[]>([])
  }

  onFilter = (keyword: string): void => {
    this.currentKeyword = keyword
    this.fetchCurrent()
  }

  onRefresh = (): void => {
    this.fetchCurrent()
  }

  private fetchCurrent(): void {
    this.loading.value = true
    this.fetcher
      .fetch(this.name, this.currentKeyword)
      .then((data) => {
        this.options.value = [...data]
      })
      .finally(() => {
        this.loading.value = false
      })
  }
}
