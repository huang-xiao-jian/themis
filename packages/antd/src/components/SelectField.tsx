import { useSignals } from '@preact/signals-react/runtime';
import type { MultipleSelectProperties, SelectProperties } from '@sisyphus/core';
import { Select, Spin } from 'antd';
import type { ReactElement, UIEvent } from 'react';
import { useCallback } from 'react';
import {
  isElementaryDynamicResource,
  isFilterableDynamicResource,
  isPaginatedDynamicResource,
  isPaginatedFilterableDynamicResource,
  isStaticResource,
} from './ResourceTypeGuard';

/** SelectField 属性 */
interface SelectFieldProps {
  readonly properties: SelectProperties | MultipleSelectProperties;
  readonly value: unknown;
  readonly onChange: (value: unknown) => void;
  readonly placeholder: string;
  readonly allowClear: boolean;
  readonly size?: 'small' | 'middle' | 'large';
  readonly mode?: 'multiple';
}

/** Select 组件 - 桥接 Resource Signal 到 antd Select */
export function SelectField({
  properties,
  value,
  onChange,
  placeholder,
  allowClear,
  size,
  mode,
}: SelectFieldProps): ReactElement {
  useSignals();
  // Cast to unknown to enable duck-typing guards (runtime resource may be any subtype)
  const resource = properties.resource as unknown;

  // 静态资源
  if (isStaticResource(resource)) {
    const options = resource.options.value;
    return (
      <Select
        value={value as string | number | undefined}
        options={[...options]}
        onChange={onChange}
        placeholder={placeholder}
        allowClear={allowClear}
        size={size}
        mode={mode}
        showSearch
        filterOption={(input, option) =>
          (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false
        }
      />
    );
  }

  // 分页+过滤动态资源
  if (isPaginatedFilterableDynamicResource(resource)) {
    const options = resource.options.value;
    const loading = resource.loading.value;
    const pagination = resource.pagination.value;

    const handleSearch = useCallback(
      (keyword: string) => {
        resource.onFilter(keyword);
      },
      [resource]
    );

    const handlePopupScroll = useCallback(
      (e: UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        if (
          target.scrollTop + target.clientHeight >= target.scrollHeight - 20 &&
          pagination.page * pagination.pageSize < pagination.total
        ) {
          resource.onFlip(pagination.page + 1);
        }
      },
      [resource, pagination]
    );

    return (
      <Select
        value={value as string | number | undefined}
        options={[...options]}
        onChange={onChange}
        placeholder={placeholder}
        allowClear={allowClear}
        size={size}
        mode={mode}
        loading={loading}
        showSearch
        filterOption={false}
        onSearch={handleSearch}
        onPopupScroll={handlePopupScroll}
        notFoundContent={loading ? <Spin size="small" /> : undefined}
      />
    );
  }

  // 分页动态资源
  if (isPaginatedDynamicResource(resource)) {
    const options = resource.options.value;
    const loading = resource.loading.value;
    const pagination = resource.pagination.value;

    const handlePopupScroll = useCallback(
      (e: UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        if (
          target.scrollTop + target.clientHeight >= target.scrollHeight - 20 &&
          pagination.page * pagination.pageSize < pagination.total
        ) {
          resource.onFlip(pagination.page + 1);
        }
      },
      [resource, pagination]
    );

    return (
      <Select
        value={value as string | number | undefined}
        options={[...options]}
        onChange={onChange}
        placeholder={placeholder}
        allowClear={allowClear}
        size={size}
        mode={mode}
        loading={loading}
        onPopupScroll={handlePopupScroll}
        notFoundContent={loading ? <Spin size="small" /> : undefined}
      />
    );
  }

  // 过滤动态资源
  if (isFilterableDynamicResource(resource)) {
    const options = resource.options.value;
    const loading = resource.loading.value;

    const handleSearch = useCallback(
      (keyword: string) => {
        resource.onFilter(keyword);
      },
      [resource]
    );

    return (
      <Select
        value={value as string | number | undefined}
        options={[...options]}
        onChange={onChange}
        placeholder={placeholder}
        allowClear={allowClear}
        size={size}
        mode={mode}
        loading={loading}
        showSearch
        filterOption={false}
        onSearch={handleSearch}
        notFoundContent={loading ? <Spin size="small" /> : undefined}
      />
    );
  }

  // 基础动态资源
  if (isElementaryDynamicResource(resource)) {
    const options = resource.options.value;
    const loading = resource.loading.value;

    return (
      <Select
        value={value as string | number | undefined}
        options={[...options]}
        onChange={onChange}
        placeholder={placeholder}
        allowClear={allowClear}
        size={size}
        mode={mode}
        loading={loading}
        notFoundContent={loading ? <Spin size="small" /> : undefined}
      />
    );
  }

  // Fallback: 未知资源类型
  return (
    <Select
      value={value as string | number | undefined}
      options={[]}
      onChange={onChange}
      placeholder={placeholder}
      allowClear={allowClear}
      size={size}
      mode={mode}
    />
  );
}
