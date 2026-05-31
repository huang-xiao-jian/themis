import { describe, expect, it } from 'vitest';
import { inferOperators } from './OperatorInferrer';
import type { RuleFactorDefinition } from '../types/DSL';

describe('inferOperators', () => {
  describe('number 类型', () => {
    it('应返回单点单值操作符', () => {
      const factor: RuleFactorDefinition = {
        name: 'age',
        title: '年龄',
        dataType: 'number',
      };

      const operators = inferOperators(factor);

      expect(operators).toHaveLength(6);
      expect(operators.map((op) => op.value)).toEqual(['=', '!=', '>', '>=', '<', '<=']);
    });

    it('应返回单点多值操作符', () => {
      const factor: RuleFactorDefinition = {
        name: 'levels',
        title: '等级',
        dataType: 'number',
        quantity: 'multiple',
      };

      const operators = inferOperators(factor);

      expect(operators).toHaveLength(2);
      expect(operators.map((op) => op.value)).toEqual(['in', 'not_in']);
    });

    it('应返回区间单值操作符', () => {
      const factor: RuleFactorDefinition = {
        name: 'price',
        title: '价格',
        dataType: 'number',
        mode: 'range',
      };

      const operators = inferOperators(factor);

      expect(operators).toHaveLength(2);
      expect(operators.map((op) => op.value)).toEqual(['between', 'not_between']);
    });

    it('应返回区间多值操作符', () => {
      const factor: RuleFactorDefinition = {
        name: 'price_ranges',
        title: '价格区间',
        dataType: 'number',
        mode: 'range',
        quantity: 'multiple',
      };

      const operators = inferOperators(factor);

      expect(operators).toHaveLength(4);
      expect(operators.map((op) => op.value)).toEqual([
        'between_any',
        'between_all',
        'not_between_any',
        'not_between_all',
      ]);
    });
  });

  describe('string 类型', () => {
    it('应返回单点单值操作符', () => {
      const factor: RuleFactorDefinition = {
        name: 'name',
        title: '名称',
        dataType: 'string',
      };

      const operators = inferOperators(factor);

      expect(operators).toHaveLength(6);
      expect(operators.map((op) => op.value)).toEqual([
        '=',
        '!=',
        'contains',
        'within',
        'starts_with',
        'ends_with',
      ]);
    });

    it('应返回单点多值操作符', () => {
      const factor: RuleFactorDefinition = {
        name: 'tags',
        title: '标签',
        dataType: 'string',
        quantity: 'multiple',
      };

      const operators = inferOperators(factor);

      expect(operators).toHaveLength(2);
      expect(operators.map((op) => op.value)).toEqual(['in', 'not_in']);
    });

    it('应返回空数组当 mode=range 时（不支持）', () => {
      const factor: RuleFactorDefinition = {
        name: 'content',
        title: '内容',
        dataType: 'string',
        mode: 'range',
      };

      const operators = inferOperators(factor);

      expect(operators).toEqual([]);
    });
  });

  describe('boolean 类型', () => {
    it('应返回 is 操作符', () => {
      const factor: RuleFactorDefinition = {
        name: 'enabled',
        title: '启用',
        dataType: 'boolean',
      };

      const operators = inferOperators(factor);

      expect(operators).toHaveLength(1);
      expect(operators[0]).toEqual({ value: 'is', label: 'is' });
    });

    it('应返回空数组当 quantity=multiple 时（不支持）', () => {
      const factor: RuleFactorDefinition = {
        name: 'flags',
        title: '标志',
        dataType: 'boolean',
        quantity: 'multiple',
      };

      const operators = inferOperators(factor);

      expect(operators).toEqual([]);
    });
  });

  describe('semantic 语义场景', () => {
    it('应将 semantic 转换为 number 类型推断逻辑', () => {
      const factor: RuleFactorDefinition = {
        name: 'create_date',
        title: '创建日期',
        dataType: 'string',
        semantic: 'date',
      };

      const operators = inferOperators(factor);

      // semantic 会将 dataType 视为 number 来推断操作符
      expect(operators).toHaveLength(6);
    });
  });

  describe('默认值处理', () => {
    it('应使用默认 mode=point', () => {
      const factor: RuleFactorDefinition = {
        name: 'score',
        title: '分数',
        dataType: 'number',
        quantity: 'single',
      };

      const operators = inferOperators(factor);

      expect(operators).toHaveLength(6);
    });

    it('应使用默认 quantity=single', () => {
      const factor: RuleFactorDefinition = {
        name: 'score',
        title: '分数',
        dataType: 'number',
        mode: 'point',
      };

      const operators = inferOperators(factor);

      expect(operators).toHaveLength(6);
    });
  });
});