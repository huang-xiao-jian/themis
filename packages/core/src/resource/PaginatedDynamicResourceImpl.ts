import { signal, type Signal } from '@preact/signals-core'
import type { PaginatedFetcher } from '../fetcher/PaginatedFetcher'
import type { Pagination } from '../fetcher/Pagination'
import type { PaginatedDynamicResource } from './DynamicResource'

/**
 * 分页动态资源实现
 */
export class PaginatedDynamicResourceImpl<T> implements PaginatedDynamicResource<T> {
  readonly name: string
  readonly loading: Signal<boolean>
  readonly options: Signal<readonly T[]>
  readonly pagination: Signal<Pagination>
  private readonly fetcher: PaginatedFetcher<T>
  private readonly defaultPageSize: number

  constructor(name: string, fetcher: PaginatedFetcher<T>, defaultPageSize = 20) {
    this.name = name
    this.fetcher = fetcher
    this.defaultPageSize = defaultPageSize
    this.loading = signal(false)
    this.options = signal<readonly T[]>([])
    this.pagination = signal<Pagination>({ page: 1, pageSize: defaultPageSize, total: 0 })
  }

  onFlip = (page: number): void => {
    this.pagination.value = { ...this.pagination.value, page }
    this.fetchCurrent()
  }

  onRefresh = (): void => {
    this.fetchCurrent()
  }

  private fetchCurrent(): void {
    const { page, pageSize } = this.pagination.value
    this.loading.value = true
    this.fetcher
      .fetch(page, pageSize)
      .then((result) => {
        this.options.value = [...result.data]
        this.pagination.value = {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
        }
      })
      .finally(() => {
        this.loading.value = false
      })
  }
}
