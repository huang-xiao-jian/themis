# 规则因子描述

## 业务目标

基于 `yaml` 设计 `DSL` 用以描述 **规则因子** 语义化结构，**规则配置器** 通过解释 **规则因子描述** 提供可交互视图，用以配置业务规则。`DSL` 设计的核心在于 **规则配置器** 能构基于 **规则因子描述** 推断合适的表单控件、合适的 **目标匹配方式** 选择范围，以及正确的边界值约束条件

## 设计原则

设计核心在于描述规则因子的 **元模型**，而非具体的规则实例，必须遵循核心原则：

- **声明式**：描述 `What`，而非 `How`，设计产出不应该包含任何技术实现细节
- **语义驱动 UI**：描述语义，而非 `UI` 结构，设计阶段不应该假设 **框架** 或者 **组件库**

## 规则因子描述设计

### 基础信息

描述规则因子的元信息：

- `name` 规则因子名称，具备唯一性
- `title` 规则因子名称
- `description` 规则因子描述

```yaml
name: deliver_city
title: 目标城市
description: 选择可发送快递的目标城市
```

### 关联资源 Resource

`Resource` 定义可选范围，限制有限范围内进行，支持静态选项、动态选项，可选集合使用统一数据结构：

```ts
interface FieldDataSource {
  label: string;
  value: string | number;
}
```

静态资源描述：

- `name` 资源名称，具备唯一性
- `options` 资源列表，遵循数据结构约束

静态资源接口声明：

```ts
interface StaticResource {
  // 约定的资源名称
  name: string;
  // 预设的可选项
  options: FieldDataSource[];
}
```

静态资源案例：

```yaml
resource:
  name: City
  options:
    - label: '北京'
      value: 'bj'
    - label: '上海'
      value: 'sh'
```

动态资源描述：

- `name` 资源名称，具备唯一性
- `features` 资源供应商支持的特性，例如：分页、关键词搜索

动态资源接口声明：

```ts
type DynamicResourceFeature = 'pagination' | 'search';

interface DynamicResource {
  // 约定的资源名称
  name: string;
  // 资源供应商支持的特性
  features: DynamicResourceFeature[];
}
```

动态资源案例：

```yaml
resource:
  name: City
```

```yaml
resource:
  name: Employees
  features: ['pagination', 'search']
```

### 数据元属性

- `dataType` 原始数据类型，支持：`string` / `number` / `boolean`
- `mode` 声明单点值或者区间值，支持：`point` / `range`
- `quantity` 声明多值或者单值，支持：`single` / `multiple`
- `semantic` 语义化场景，作为原始数据类型的精细化扩充，例如：

`mode` + `quantity` 正交逻辑：

| mode    | quantity   | 业务含义     | 匹配逻辑                 |
| :------ | :--------- | :----------- | :----------------------- |
| `point` | `single`   | 单个值       | `target = value`         |
| `point` | `multiple` | 多个离散值   | `target in [v1, v2]`     |
| `range` | `single`   | 单个连续区间 | `min <= target <= max`   |
| `range` | `multiple` | 多个离散区间 | `(t in r1) or (t in r2)` |

`semantic` 语义化场景支持：

- `rate`
- `date`
- `time`
- `duration`
- `percentage`

### 数据约束与校验

`constraints` 字段用于定义数据的合法性规则

**原始数据类型** 的约束如下：

| 约束字段           | 适用类型        | 说明              |
| :----------------- | :-------------- | :---------------- |
| `min`              | number / string | 最小值 / 最小长度 |
| `max`              | number / string | 最大值 / 最大长度 |
| `exclusiveMinimum` | number / string | 最小值 / 最小长度 |
| `exclusiveMaximum` | number / string | 最大值 / 最大长度 |
| `step`             | number          | 步长              |
| `precision`        | number          | 小数精度          |
| `format`           | string          | 字符串格式        |
| `pattern`          | string          | 正则表达式校验    |

特别说明：最大值，最小值约定：开区间 `(exclusiveMinimum, exclusiveMaximum)`，闭区间 `[min, max]`

**多值场景** 的约束如下，约定闭区间：`[minItems, maxItems]`

| 约束字段   | quantity   | 说明     |
| :--------- | :--------- | :------- |
| `minItems` | `multiple` | 最少数量 |
| `maxItems` | `multiple` | 最大数量 |

## 规则因子 Operator

推断逻辑：根据 `dataType` + `semantic` 确定“数据域”，再结合 `mode`（点/区间）和 `quantity`（单/多）确定“操作域”，从而锁定可用的 `operator` 列表

### 数据类型推断 DataType

| dataType | mode  | quantity | 推断的 Operator 语义                                              |
| :------- | :---- | :------- | :---------------------------------------------------------------- |
| number   | point | single   | `=`, `≠`, `>`, `>=`, `<`, `<=`                                    |
| number   | point | multiple | `in`, `not in`                                                    |
| number   | range | single   | `between`, `not between`                                          |
| number   | range | multiple | `between any`, `betwen all`, `not between any`, `not between all` |
| string   | point | single   | `=`, `≠`, `contains`, `within`, `starts_with`, `ends_with`        |
| string   | point | multiple | `in`, `not in`                                                    |
| boolean  | point | single   | `is`                                                              |

### 场景推断 Semantic

### Number 类型继承

以下 `Semantic` 本质上遵循 `dataType=number` 的 `operator` 可选范围：

- `rate`
- `date`
- `time`
- `duration`
- `percentage`

## 业务集成

- [规则配置中心](./references/setter.md) 基于 **规则因子描述** 提供配置器，用户按需配置规则因子形成 **业务规则**
