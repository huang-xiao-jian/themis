import { describe, expect, it } from 'vitest';
import { validateThreshold } from './Validation';

describe('validateThreshold', () => {
  describe('基础类型验证', () => {
    it('应拒绝 number 类型但值为字符串', () => {
      const result = validateThreshold('123', undefined, 'number');
      expect(result).toBe(false);
    });

    it('应拒绝 string 类型但值为数字', () => {
      const result = validateThreshold(123, undefined, 'string');
      expect(result).toBe(false);
    });

    it('应拒绝 boolean 类型但值为字符串', () => {
      const result = validateThreshold('true', undefined, 'boolean');
      expect(result).toBe(false);
    });

    it('应拒绝 NaN 当 dataType=number', () => {
      const result = validateThreshold(NaN, undefined, 'number');
      expect(result).toBe(false);
    });

    it('无 dataType 时应接受任意类型值', () => {
      expect(validateThreshold('test', undefined)).toBe(true);
      expect(validateThreshold(123, undefined)).toBe(true);
      expect(validateThreshold(true, undefined)).toBe(true);
    });
  });

  describe('number 类型约束验证', () => {
    it('应拒绝小于 min 的值', () => {
      const result = validateThreshold(5, { min: 10 }, 'number');
      expect(result).toBe(false);
    });

    it('应接受等于 min 的值', () => {
      const result = validateThreshold(10, { min: 10 }, 'number');
      expect(result).toBe(true);
    });

    it('应拒绝大于 max 的值', () => {
      const result = validateThreshold(150, { max: 100 }, 'number');
      expect(result).toBe(false);
    });

    it('应接受等于 max 的值', () => {
      const result = validateThreshold(100, { max: 100 }, 'number');
      expect(result).toBe(true);
    });

    it('应拒绝小于等于 exclusiveMinimum 的值', () => {
      const result = validateThreshold(10, { exclusiveMinimum: 10 }, 'number');
      expect(result).toBe(false);
    });

    it('应接受大于 exclusiveMinimum 的值', () => {
      const result = validateThreshold(11, { exclusiveMinimum: 10 }, 'number');
      expect(result).toBe(true);
    });

    it('应拒绝大于等于 exclusiveMaximum 的值', () => {
      const result = validateThreshold(100, { exclusiveMaximum: 100 }, 'number');
      expect(result).toBe(false);
    });

    it('应接受小于 exclusiveMaximum 的值', () => {
      const result = validateThreshold(99, { exclusiveMaximum: 100 }, 'number');
      expect(result).toBe(true);
    });

    it('应拒绝超过 precision 的小数位', () => {
      const result = validateThreshold(1.234, { precision: 2 }, 'number');
      expect(result).toBe(false);
    });

    it('应接受符合 precision 的小数位', () => {
      const result = validateThreshold(1.23, { precision: 2 }, 'number');
      expect(result).toBe(true);
    });

    it('应接受整数（无小数位）', () => {
      const result = validateThreshold(100, { precision: 2 }, 'number');
      expect(result).toBe(true);
    });
  });

  describe('string 类型约束验证', () => {
    it('应拒绝短于 min 的字符串', () => {
      const result = validateThreshold('ab', { min: 3 }, 'string');
      expect(result).toBe(false);
    });

    it('应接受等于 min 长度的字符串', () => {
      const result = validateThreshold('abc', { min: 3 }, 'string');
      expect(result).toBe(true);
    });

    it('应拒绝长于 max 的字符串', () => {
      const result = validateThreshold('abcdef', { max: 5 }, 'string');
      expect(result).toBe(false);
    });

    it('应接受等于 max 长度的字符串', () => {
      const result = validateThreshold('abcde', { max: 5 }, 'string');
      expect(result).toBe(true);
    });

    it('应拒绝不匹配 pattern 的字符串', () => {
      const result = validateThreshold('abc', { pattern: '^[0-9]+$' }, 'string');
      expect(result).toBe(false);
    });

    it('应接受匹配 pattern 的字符串', () => {
      const result = validateThreshold('12345', { pattern: '^[0-9]+$' }, 'string');
      expect(result).toBe(true);
    });

    it('应拒绝不匹配 format 的字符串', () => {
      const result = validateThreshold('invalid-email', { format: '^[^@]+@[^@]+\\.[^@]+$' }, 'string');
      expect(result).toBe(false);
    });

    it('应接受匹配 format 的字符串', () => {
      const result = validateThreshold('test@example.com', { format: '^[^@]+@[^@]+\\.[^@]+$' }, 'string');
      expect(result).toBe(true);
    });
  });

  describe('多值场景约束验证', () => {
    it('应拒绝少于 minItems 的数组', () => {
      const result = validateThreshold([1, 2], { minItems: 3 });
      expect(result).toBe(false);
    });

    it('应接受等于 minItems 的数组', () => {
      const result = validateThreshold([1, 2, 3], { minItems: 3 });
      expect(result).toBe(true);
    });

    it('应拒绝多于 maxItems 的数组', () => {
      const result = validateThreshold([1, 2, 3, 4, 5, 6], { maxItems: 5 });
      expect(result).toBe(false);
    });

    it('应接受等于 maxItems 的数组', () => {
      const result = validateThreshold([1, 2, 3, 4, 5], { maxItems: 5 });
      expect(result).toBe(true);
    });

    it('数组元素类型应与 dataType 一致', () => {
      // 当 dataType='number' 时，数组内元素必须是 number
      const result = validateThreshold([1, 2, 'three'], { minItems: 2 }, 'number');
      expect(result).toBe(false); // 因为 'three' 是字符串，不是 number
    });

    it('纯 number 数组应通过验证（无 dataType 指定）', () => {
      const result = validateThreshold([1, 2, 3], { minItems: 2 });
      expect(result).toBe(true);
    });
  });

  describe('组合约束验证', () => {
    it('应同时验证多个约束', () => {
      const result = validateThreshold(50, { min: 0, max: 100 }, 'number');
      expect(result).toBe(true);
    });

    it('任一约束失败即返回 false', () => {
      const result = validateThreshold(150, { min: 0, max: 100 }, 'number');
      expect(result).toBe(false);
    });

    it('string 类型应同时支持长度和正则约束', () => {
      const result = validateThreshold('abc123', { min: 3, max: 10, pattern: '^[a-z]+[0-9]+$' }, 'string');
      expect(result).toBe(true);
    });
  });

  describe('边界情况', () => {
    it('空数组应通过 minItems=0 验证', () => {
      const result = validateThreshold([], { minItems: 0 });
      expect(result).toBe(true);
    });

    it('空字符串应通过 min=0 验证', () => {
      const result = validateThreshold('', { min: 0 }, 'string');
      expect(result).toBe(true);
    });

    it('负数应通过 min 约束验证', () => {
      const result = validateThreshold(-50, { min: -100, max: 100 }, 'number');
      expect(result).toBe(true);
    });

    it('小数应通过 min 约束验证', () => {
      const result = validateThreshold(0.5, { min: 0, max: 1 }, 'number');
      expect(result).toBe(true);
    });

    it('无约束时任何有效类型都应返回 true', () => {
      expect(validateThreshold(42, undefined, 'number')).toBe(true);
      expect(validateThreshold('hello', undefined, 'string')).toBe(true);
      expect(validateThreshold(false, undefined, 'boolean')).toBe(true);
    });

    it('undefined 值应通过基础类型验证（dataType 未指定时）', () => {
      expect(validateThreshold(undefined, undefined)).toBe(true);
    });

    it('null 值应通过基础类型验证（dataType 未指定时）', () => {
      expect(validateThreshold(null, undefined)).toBe(true);
    });
  });
});