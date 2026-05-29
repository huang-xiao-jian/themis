/**
 * 资源定义
 */
export interface ResourceDefinition {
  name: string;
  features?: ('pagination' | 'filter')[];
}

/**
 * 数据约束
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
 * 语义化场景
 */
export type SemanticType = 'rate' | 'date' | 'time' | 'datetime' | 'duration' | 'percentage';

/**
 * 交互模式
 */
export type PromptMode = 'point' | 'range';

/**
 * 关联数量
 */
export type Quantity = 'single' | 'multiple';

/**
 * 数据类型
 */
export type DataType = 'string' | 'number' | 'boolean';

/**
 * 规则因子定义
 */
export interface RuleFactorDefinition {
  /** 规则因子名称 */
  name: string;
  /** 规则因子标题 */
  title: string;
  /** 规则因子描述 */
  description?: string;
  /** 数据类型 */
  dataType: DataType;
  /** 语义化场景 */
  semantic?: SemanticType;
  /** 交互模式 */
  mode?: PromptMode;
  /** 关联数量 */
  quantity?: Quantity;
  /** 关联资源 */
  resource?: ResourceDefinition;
  /** 数据约束 */
  constraints?: FieldConstraints;
}
