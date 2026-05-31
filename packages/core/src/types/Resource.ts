import type { FieldDataSource } from './Fetcher';

/**
 * 分页状态
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * Signal 类型 - alien-signals 响应式原语
 */
export type Signal<T> = {
  (): T;
  (value: T): void;
};

/**
 * 只读 Signal 类型
 */
export type ReadonlySignal<T> = () => T;

/**
 * 静态资源 - 预设选项，无需动态加载
 */
export interface IStaticResource<T extends FieldDataSource = FieldDataSource> {
  /** 资源标识 */
  readonly name: string;
  /** 数据列表 Signal */
  readonly options: ReadonlySignal<readonly T[]>;
  /** 根据 value 本地筛选对应的 option */
  onFiltrate: (value: string | number) => void;
}

/**
 * 动态资源 - 不支持分页 + 不支持服务端过滤
 */
export interface IElementaryDynamicResource<T extends FieldDataSource = FieldDataSource> {
  /** 资源标识 */
  readonly name: string;
  /** 加载状态 Signal */
  readonly loading: ReadonlySignal<boolean>;
  /** 数据列表 Signal */
  readonly options: ReadonlySignal<readonly T[]>;
  /** 重新加载数据 */
  onRefresh: () => void;
  /** 根据 value 本地筛选对应的 option */
  onFiltrate: (value: string | number) => void;
}

/**
 * 动态资源 - 支持分页 + 不支持服务端过滤
 */
export interface IPaginatedDynamicResource<T extends FieldDataSource = FieldDataSource> {
  /** 资源标识 */
  readonly name: string;
  /** 加载状态 Signal */
  readonly loading: ReadonlySignal<boolean>;
  /** 数据列表 Signal */
  readonly options: ReadonlySignal<readonly T[]>;
  /** 分页状态 Signal */
  readonly pagination: ReadonlySignal<Pagination>;
  /** 翻页操作 */
  onFlip: (page: number) => void;
  /** 重新加载数据 */
  onRefresh: () => void;
}

/**
 * 动态资源 - 不支持分页 + 支持服务端过滤
 */
export interface IFilterableDynamicResource<T extends FieldDataSource = FieldDataSource> {
  /** 资源标识 */
  readonly name: string;
  /** 加载状态 Signal */
  readonly loading: ReadonlySignal<boolean>;
  /** 数据列表 Signal */
  readonly options: ReadonlySignal<readonly T[]>;
  /** 执行过滤搜索 */
  onFilter: (keyword: string) => void;
  /** 重新加载数据 */
  onRefresh: () => void;
}

/**
 * 动态资源 - 支持分页 + 支持服务端过滤
 */
export interface IPaginatedFilterableDynamicResource<T extends FieldDataSource = FieldDataSource> {
  /** 资源标识 */
  readonly name: string;
  /** 加载状态 Signal */
  readonly loading: ReadonlySignal<boolean>;
  /** 数据列表 Signal */
  readonly options: ReadonlySignal<readonly T[]>;
  /** 分页状态 Signal */
  readonly pagination: ReadonlySignal<Pagination>;
  /** 关键词 Signal */
  readonly keyword: ReadonlySignal<string>;
  /** 翻页操作 */
  onFlip: (page: number) => void;
  /** 执行过滤搜索 */
  onFilter: (keyword: string) => void;
  /** 重新加载数据 */
  onRefresh: () => void;
}

/**
 * Resource 类型联合
 */
export type Resource<T extends FieldDataSource = FieldDataSource> =
  | IStaticResource<T>
  | IElementaryDynamicResource<T>
  | IPaginatedDynamicResource<T>
  | IFilterableDynamicResource<T>
  | IPaginatedFilterableDynamicResource<T>;