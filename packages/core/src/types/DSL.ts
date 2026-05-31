/**
 * 数据元属性 - 数据类型
 */
export type DataType = 'string' | 'number' | 'boolean';

/**
 * 数据元属性 - 语义化场景
 */
export type Semantic =
  | 'rate'
  | 'date'
  | 'time'
  | 'datetime'
  | 'duration'
  | 'percentage';

/**
 * 数据元属性 - 交互模式
 */
export type Mode = 'point' | 'range';

/**
 * 数据元属性 - 关联数量
 */
export type Quantity = 'single' | 'multiple';

/**
 * 动态资源特性
 */
export type DynamicResourceFeature = 'pagination' | 'filter';

/**
 * 数据约束定义
 */
export interface FieldConstraints {
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

/**
 * 资源定义
 */
export interface ResourceDefinition {
  /** 资源名称 */
  name: string;
  /** 资源特性 */
  features?: DynamicResourceFeature[];
}

/**
 * 规则因子定义
 */
export interface RuleFactorDefinition {
  /** 规则因子名称（唯一） */
  name: string;
  /** 显示标题 */
  title: string;
  /** 描述信息 */
  description?: string;
  /** 数据类型 */
  dataType: DataType;
  /** 语义化场景 */
  semantic?: Semantic;
  /** 交互模式（单点值或区间值） */
  mode?: Mode;
  /** 关联数量（单值或多值） */
  quantity?: Quantity;
  /** 关联资源 */
  resource?: ResourceDefinition;
  /** 数据约束 */
  constraints?: FieldConstraints;
}