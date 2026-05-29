# 规则因子设计

## Resource 设计

### Resource 设计目标

`Resource` 封装为领域实体，屏蔽原始 `DSL` 定义与 `HTTP Fetcher` 等细节，**框架适配层** 按照规范解释为领域实体，属性传递 **组件适配层**。分层职能上，**组件适配层** 对领域实体无任何感知

### Resource 设计规范

- 属性包含 `options` 响应式数据，使用 `Signal` 作为响应式实体
- 交互方法采用 `onXXX` 事件绑定风格

### Resource 封装

```ts
/**
 * 静态资源 - 预设选项，无需动态加载
 */
interface StaticResource<T extends FieldDataSource> {
  /**
   * 资源标识
   */
  readonly name: string;
  /**
   * 数据列表 Signal
   */
  readonly options: Signal<readonly T[]>;
  /**
   * 根据 value 本地筛选对应的 option
   */
  onFiltrate: (value: string | number) => void;
}

/**
 * 动态资源 - 不支持分页 + 不支持服务端过滤
 */
interface ElementaryDynamicResource<T extends FieldDataSource> {
  /**
   * 资源标识
   */
  readonly name: string;
  /**
   * 加载状态 Signal
   */
  readonly loading: Signal<boolean>;
  /**
   * 数据列表 Signal
   */
  readonly options: Signal<readonly T[]>;
  /**
   * 重新加载数据
   */
  onRefresh: () => void;
  /**
   * 根据 value 本地筛选对应的 option
   */
  onFiltrate: (value: string | number) => void;
}

/**
 * 动态资源 - 支持分页 + 不支持服务端过滤
 */
interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

interface PaginatedDynamicResource<T extends FieldDataSource> {
  /**
   * 资源标识
   */
  readonly name: string;
  /**
   * 加载状态 Signal
   */
  readonly loading: Signal<boolean>;
  /**
   * 数据列表 Signal
   */
  readonly options: Signal<readonly T[]>;
  /**
   * 分页状态 Signal
   */
  readonly pagination: Signal<Pagination>;
  /**
   * 翻页操作
   */
  onFlip: (page: number) => void;
  /**
   * 重新加载数据
   */
  onRefresh: () => void;
}

/**
 * 动态资源 - 不支持分页 + 支持服务端过滤
 */
interface FilterableDynamicResource<T extends FieldDataSource> {
  /**
   * 资源标识
   */
  readonly name: string;
  /**
   * 加载状态 Signal
   */
  readonly loading: Signal<boolean>;
  /**
   * 数据列表 Signal
   */
  readonly options: Signal<readonly T[]>;
  /**
   * 执行过滤搜索
   */
  onFilter: (keyword: string) => void;
  /**
   * 重新加载数据
   */
  onRefresh: () => void;
}

/**
 * 动态资源 - 支持分页 + 支持服务端过滤
 */
interface PaginatedFilterableDynamicResource<T extends FieldDataSource> {
  /**
   * 资源标识
   */
  readonly name: string;
  /**
   * 加载状态 Signal
   */
  readonly loading: Signal<boolean>;
  /**
   * 数据列表 Signal
   */
  readonly options: Signal<readonly T[]>;
  /**
   * 分页状态 Signal
   */
  readonly pagination: Signal<Pagination>;
  /**
   * 关键词 Signal
   */
  readonly keyword: Signal<string>;
  /**
   * 翻页操作
   */
  onFlip: (page: number) => void;
  /**
   * 执行过滤搜索
   */
  onFilter: (keyword: string) => void;
  /**
   * 重新加载数据
   */
  onRefresh: () => void;
}
```

## 抽象组件设计

### 抽象组件设计目标

明确 **抽象组件** 的属性，屏蔽掉原始 `DSL` 定义，以及承担 `Resource` 的解释传递职能

### 抽象组件设计规范

- 避免框架的细节侵入，统一使用 `Properties` 作为后缀
- 避免组件的细节侵入，避免出现表单控件的交互属性，约定隐式继承

### 抽象组件属性声明

抽象组件统一继承 `BaseProperties`，组件特定属性按需扩展：

```ts
/**
 * 抽象组件基础属性
 */
interface BaseProperties {
  /** 字段标识 */
  name: string;
  /** 字段标题 */
  title: string;
  /** 数据类型 */
  dataType: 'string' | 'number' | 'boolean';
  /** 语义化场景 */
  semantic?: 'rate' | 'date' | 'time' | 'datetime' | 'duration' | 'percentage';
  /** 数据约束 */
  constraints?: FieldConstraints;
}

/**
 * 约束定义
 */
interface FieldConstraints {
  /** 最小值 / 最小长度 */
  min?: number | string;
  /** 最大值 / 最大长度 */
  max?: number | string;
  /** 开区间最小值 */
  exclusiveMinimum?: number | string;
  /** 开区间最大值 */
  exclusiveMaximum?: number | string;
  /** 步长 */
  step?: number;
  /** 小数精度 */
  precision?: number;
  /** 字符串格式 */
  format?: string;
  /** 正则表达式 */
  pattern?: string;
  /** 多值最少数量 */
  minItems?: number;
  /** 多值最大数量 */
  maxItems?: number;
}
```

### InputProperties - 单行输入

适用于短文本输入场景（长度 ≤ 100）：

```ts
interface InputProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'Input';
}
```

### TextAreaProperties - 多行文本输入

适用于长文本输入场景（长度 > 100）：

```ts
interface TextAreaProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'TextArea';
}
```

### RangeInputProperties - 区间输入

适用于区间输入场景：

```ts
interface RangeInputProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'RangeInput';
}
```

### SwitchProperties - 开关

适用于布尔类型场景：

```ts
interface SwitchProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'Switch';
}
```

### SelectProperties - 单选

适用于受限单选场景（关联 Resource）：

```ts
interface SelectProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'Select';
  /** 数据资源 */
  readonly resource: StaticResource<any> | ElementaryDynamicResource<any>;
}
```

### MultipleSelectProperties - 多选

适用于受限多选场景（关联 Resource）：

```ts
interface MultipleSelectProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'MultipleSelect';
  /** 数据资源 */
  readonly resource: StaticResource<any> | ElementaryDynamicResource<any>;
}
```

### PickerProperties - 选择器

适用于自动选择场景（如日期选择、数值选择）：

```ts
interface PickerProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'Picker';
}
```

### RangePickerProperties - 区间选择器

适用于区间选择场景（如日期范围选择）：

```ts
interface RangePickerProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'RangePicker';
}
```

### ListBuilderProperties - 列表构建器

适用于多值单点输入场景，用于构建多个单点值：

```ts
interface ListBuilderProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'ListBuilder';
  /** 列表项组件类型 */
  itemType: 'Input' | 'Picker';
}
```

### ListRangeBuilderProperties - 区间列表构建器

适用于多值区间输入场景，用于构建多个区间值：

```ts
interface ListRangeBuilderProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'ListRangeBuilder';
  /** 列表项组件类型 */
  itemType: 'RangeInput' | 'RangePicker';
}
```

### 抽象组件类型联合

```ts
type AbstractComponentProperties =
  | InputProperties
  | TextAreaProperties
  | RangeInputProperties
  | SwitchProperties
  | SelectProperties
  | MultipleSelectProperties
  | PickerProperties
  | RangePickerProperties
  | ListBuilderProperties
  | ListRangeBuilderProperties;
```

### 抽象组件与 Resource 映射关系

| 抽象组件         | 关联 Resource 类型                             |
| :--------------- | :--------------------------------------------- |
| `Select`         | `StaticResource` / `ElementaryDynamicResource` |
| `MultipleSelect` | `StaticResource` / `ElementaryDynamicResource` |
| 其他组件         | 无需关联 Resource                              |

### 抽象组件属性解构来源

| 属性类别      | 来源说明                                             |
| :------------ | :--------------------------------------------------- |
| `dataType`    | DSL 直接继承                                         |
| `semantic`    | DSL 直接继承                                         |
| `constraints` | DSL `constraints` 解构，按组件类型选取适用的约束字段 |
| `resource`    | DSL `resource` 字段解释，Select 类组件专属           |
| `itemType`    | 根据推断规则确定，用于列表构建器组件                 |
