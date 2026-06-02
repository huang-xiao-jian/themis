import type {
  ElementaryDynamicResource,
  FieldDataSource,
  FilterableDynamicResource,
  PaginatedDynamicResource,
  PaginatedFilterableDynamicResource,
  StaticResource,
} from '@sisyphus/core';

/**
 * Resource 鸭子类型守卫
 *
 * 通过运行时属性特征判定 Resource 亚型，
 * 便于 Select 组件按亚型映射 antd 属性。
 *
 * 类型定义由 @sisyphus/core 内核负责，此处仅做运行时判定
 */

/** 静态资源守卫 */
export function isStaticResource(resource: unknown): resource is StaticResource<FieldDataSource> {
  return (
    resource != null &&
    typeof resource === 'object' &&
    'options' in resource &&
    'onFiltrate' in resource &&
    !('loading' in resource)
  );
}

/** 基础动态资源守卫（无分页、无过滤） */
export function isElementaryDynamicResource(
  resource: unknown
): resource is ElementaryDynamicResource<FieldDataSource> {
  return (
    resource != null &&
    typeof resource === 'object' &&
    'loading' in resource &&
    'onRefresh' in resource &&
    'onFiltrate' in resource &&
    !('pagination' in resource) &&
    !('onFilter' in resource)
  );
}

/** 分页动态资源守卫 */
export function isPaginatedDynamicResource(
  resource: unknown
): resource is PaginatedDynamicResource<FieldDataSource> {
  return (
    resource != null &&
    typeof resource === 'object' &&
    'loading' in resource &&
    'pagination' in resource &&
    'onFlip' in resource &&
    'onRefresh' in resource &&
    !('onFilter' in resource)
  );
}

/** 过滤动态资源守卫 */
export function isFilterableDynamicResource(
  resource: unknown
): resource is FilterableDynamicResource<FieldDataSource> {
  return (
    resource != null &&
    typeof resource === 'object' &&
    'loading' in resource &&
    'onFilter' in resource &&
    'onRefresh' in resource &&
    !('pagination' in resource)
  );
}

/** 分页+过滤动态资源守卫 */
export function isPaginatedFilterableDynamicResource(
  resource: unknown
): resource is PaginatedFilterableDynamicResource<FieldDataSource> {
  return (
    resource != null &&
    typeof resource === 'object' &&
    'loading' in resource &&
    'pagination' in resource &&
    'onFilter' in resource &&
    'onFlip' in resource &&
    'onRefresh' in resource
  );
}
