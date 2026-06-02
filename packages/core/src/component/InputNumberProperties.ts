import type { BaseProperties } from './BaseProperties';

/**
 * 数值输入
 *
 * 适用场景：number + manual + point + single
 * 映射到 antd InputNumber 组件，支持 step/precision/min/max 等约束
 */
export interface InputNumberProperties extends BaseProperties {
  readonly type: 'InputNumber';
}
