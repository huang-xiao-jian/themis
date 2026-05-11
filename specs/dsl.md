# 规则因子 DSL

## 业务目标

设计定义规则因子的 DSL，规则定

## 核心设计理念

本 DSL 旨在描述规则的**元模型**，而非具体的规则实例。其核心原则是：

- **声明式而非命令式**：描述“是什么”（What），而非“怎么做”（How）。DSL 不包含任何代码逻辑或技术实现细节。
- **语义驱动 UI**：通过 `type`、`semantic`、`options` 等字段提供足够的信息，让解释器能够推断并渲染出合适的用户界面。
- **关注点分离**：
  - **DSL**：负责定义数据结构、校验规则和交互语义。
  - **解释器**：负责解析 DSL、渲染 UI、处理用户输入和数据获取。
  - **资源层**：负责提供外部数据，对 DSL 透明。

## 规则因子结构定义

一个规则因子是规则的最小组成单元，其 YAML 结构包含以下几个核心部分：

```yaml
# 规则因子模板定义
factor_template:
  # --- 基础信息 ---
  id: 'unique_factor_id' # [String] 唯一标识符，用于程序识别
  label: '用户友好的显示名称' # [String] 用于 UI 标签展示
  target: 'data.path' # [String] 待校验数据的路径（如 user.age）
  operator: 'OP_CODE' # [String] 预定义的算子码（如 GT, EQ, IN）

  # --- 核心配置区 ---
  config:
    type: '...' # [String] 数据类型定义
    semantic: '...' # [String] 业务语义定义
    options: ... # [Any] 选项配置（静态或资源引用）
    constraints: ... # [Object] 校验约束条件
```

## 配置层级与 UI 推断机制

解释器通过读取 `config` 下的三个关键字段来决定如何渲染输入组件。推断优先级为：**Options > Semantic > Type**。

## 类型定义

用于确定数据的底层存储格式和基础 HTML 元素。

| type 值    | 对应数据类型 | 默认基础组件      |
| :--------- | :----------- | :---------------- |
| `number`   | 数值型       | InputNumber       |
| `string`   | 字符串       | Input             |
| `boolean`  | 布尔值       | Switch            |
| `string[]` | 字符串数组   | Select (Multiple) |

## 语义定义

用于覆盖基础组件，提供更符合业务场景的交互体验。

| semantic 值  | 推荐组件    | 适用场景                          |
| :----------- | :---------- | :-------------------------------- |
| `percentage` | Slider      | 比例、百分比配置                  |
| `date`       | DatePicker  | 日期选择                          |
| `date-range` | RangePicker | 时间区间选择                      |
| `time`       | TimePicker  | 时间点选择                        |
| `ip`         | IpInput     | IP 地址录入                       |
| `code`       | CodeEditor  | JSON/YAML 代码编辑                |
| `plain`      | (无)        | 保持默认或使用 Options 决定的组件 |

## 选项配置

当 `config.options` 存在时，优先渲染为选择类组件（Select / TreeSelect）。支持两种模式：

**静态数据模式**
直接嵌入选项列表。解释器根据数组结构自动推断使用普通选择器还是树形选择器。

```yaml
config:
  type: string
  options:
    # 扁平结构 -> Select
    - label: '北京'
      value: 'bj'
    - label: '上海'
      value: 'sh'
```

```yaml
config:
  type: string
  options:
    # 层级结构 (含 children) -> TreeSelect
    - label: '电子产品'
      value: 'elec'
      children:
        - label: '手机'
          value: 'mobile'
```

**资源引用模式**
引用外部注册的数据资源，实现动态数据加载。DSL 仅声明依赖，不关心获取方式。

```yaml
config:
  type: string
  options:
    resourceId: 'departments' # 引用已注册的资源 ID
    transform: # 字段映射
      labelField: 'name' # 映射显示字段
      valueField: 'id' # 映射值字段
```

## 约束与校验

`constraints` 字段用于定义数据的合法性规则，解释器应将其映射为表单校验逻辑。

| 约束字段    | 适用类型 | 说明                |
| :---------- | :------- | :------------------ |
| `required`  | All      | 是否必填            |
| `min`       | number   | 最小值              |
| `max`       | number   | 最大值              |
| `step`      | number   | 步长（配合 Slider） |
| `precision` | number   | 小数精度            |
| `regex`     | string   | 正则表达式校验      |
| `minLength` | string   | 最小长度            |
| `maxLength` | string   | 最大长度            |

## 参考案例

```yaml
factor_template:
  id: 'order_risk_check'
  label: '订单风险等级筛选'
  target: 'order.riskLevel'
  operator: 'EQ'

  config:
    # 1. 基础类型
    type: string

    # 2. 语义：普通选择
    semantic: plain

    # 3. 选项：引用外部资源
    options:
      resourceId: 'risk_levels'
      transform:
        labelField: 'levelName'
        valueField: 'levelCode'

    # 4. 约束
    constraints:
      required: true
```
