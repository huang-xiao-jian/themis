import type { Signal } from '@preact/signals-core'

/**
 * 静态资源 - 预设选项，无需动态加载
 */
export interface StaticResource<T> {
  readonly name: string
  readonly options: Signal<readonly T[]>
  onFiltrate: (value: string | number) => void
}
