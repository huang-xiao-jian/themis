/**
 * 字段约束定义
 *
 * 用于规则因子的边界值校验与表单组件属性推导
 */
export interface FieldConstraints {
  /** 最小值（number 类型）/ 最小长度（string 类型） */
  readonly min?: number | string;
  /** 最大值（number 类型）/ 最大长度（string 类型） */
  readonly max?: number | string;
  /** 开区间最小值 */
  readonly exclusiveMinimum?: number | string;
  /** 开区间最大值 */
  readonly exclusiveMaximum?: number | string;
  /** 步长（仅 number 类型） */
  readonly step?: number;
  /** 小数精度（仅 number 类型） */
  readonly precision?: number;
  /** 字符串格式（如 email、uri） */
  readonly format?: string;
  /** 正则表达式 */
  readonly pattern?: string;
  /** 多值场景下的最少数量（quantity=multiple） */
  readonly minItems?: number;
  /** 多值场景下的最大数量（quantity=multiple） */
  readonly maxItems?: number;
}
