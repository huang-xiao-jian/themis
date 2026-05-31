import type { FieldConstraints } from '../types/DSL';

/**
 * 验证阈值是否满足约束条件
 *
 * @param value 阈值
 * @param constraints 约束定义
 * @param dataType 数据类型
 * @returns 是否有效
 */
export function validateThreshold(
  value: unknown,
  constraints?: FieldConstraints,
  dataType?: 'string' | 'number' | 'boolean'
): boolean {
  // 基础类型验证
  if (dataType === 'number') {
    if (typeof value !== 'number') return false;
    if (Number.isNaN(value)) return false;
  }
  if (dataType === 'string') {
    if (typeof value !== 'string') return false;
  }
  if (dataType === 'boolean') {
    if (typeof value !== 'boolean') return false;
  }

  // 约束验证
  if (constraints) {
    if (typeof value === 'string') {
      if (constraints.min !== undefined && typeof constraints.min === 'number') {
        if (value.length < constraints.min) return false;
      }
      if (constraints.max !== undefined && typeof constraints.max === 'number') {
        if (value.length > constraints.max) return false;
      }
      if (constraints.pattern) {
        const regex = new RegExp(constraints.pattern);
        if (!regex.test(value)) return false;
      }
      if (constraints.format) {
        const formatRegex = new RegExp(constraints.format);
        if (!formatRegex.test(value)) return false;
      }
    }

    if (typeof value === 'number') {
      if (constraints.min !== undefined && typeof constraints.min === 'number') {
        if (value < constraints.min) return false;
      }
      if (constraints.max !== undefined && typeof constraints.max === 'number') {
        if (value > constraints.max) return false;
      }
      if (
        constraints.exclusiveMinimum !== undefined &&
        typeof constraints.exclusiveMinimum === 'number'
      ) {
        if (value <= constraints.exclusiveMinimum) return false;
      }
      if (
        constraints.exclusiveMaximum !== undefined &&
        typeof constraints.exclusiveMaximum === 'number'
      ) {
        if (value >= constraints.exclusiveMaximum) return false;
      }
      if (constraints.precision !== undefined) {
        const decimals = (value.toString().split('.')[1] || '').length;
        if (decimals > constraints.precision) return false;
      }
    }

    // 多值场景验证
    if (Array.isArray(value)) {
      if (constraints.minItems !== undefined) {
        if (value.length < constraints.minItems) return false;
      }
      if (constraints.maxItems !== undefined) {
        if (value.length > constraints.maxItems) return false;
      }
    }
  }

  return true;
}