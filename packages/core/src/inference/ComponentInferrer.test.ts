import { describe, expect, it } from 'vitest';
import { inferComponent } from './ComponentInferrer';
import type { RuleFactorDefinition } from '../types/DSL';
import type { IStaticResource } from '../types/Resource';
import type {
  SelectProperties,
  MultipleSelectProperties,
  ListBuilderProperties,
  ListRangeBuilderProperties,
  SwitchProperties,
  InputProperties,
} from '../types/Inference';

describe('inferComponent', () => {
  describe('有 resource 时', () => {
    it('应返回 Select 组件当 quantity=single', () => {
      const factor: RuleFactorDefinition = {
        name: 'category',
        title: '类别',
        dataType: 'number',
      };

      // 创建模拟的静态资源
      const mockResource: IStaticResource = {
        name: 'categories',
        options: () => [],
        onFiltrate: () => {},
      };

      const result = inferComponent(factor, mockResource) as SelectProperties;

      expect(result.type).toBe('Select');
      expect(result.name).toBe('category');
      expect(result.title).toBe('类别');
      expect(result.dataType).toBe('number');
    });

    it('应返回 MultipleSelect 组件当 quantity=multiple', () => {
      const factor: RuleFactorDefinition = {
        name: 'tags',
        title: '标签',
        dataType: 'string',
        quantity: 'multiple',
      };

      // 创建模拟的静态资源
      const mockResource: IStaticResource = {
        name: 'tags',
        options: () => [],
        onFiltrate: () => {},
      };

      const result = inferComponent(factor, mockResource) as MultipleSelectProperties;

      expect(result.type).toBe('MultipleSelect');
      expect(result.name).toBe('tags');
      expect(result.resource.name).toBe('tags');
    });
  });

  describe('dataType=boolean 时', () => {
    it('应返回 Switch 组件', () => {
      const factor: RuleFactorDefinition = {
        name: 'enabled',
        title: '启用',
        dataType: 'boolean',
      };

      const result = inferComponent(factor) as SwitchProperties;

      expect(result.type).toBe('Switch');
      expect(result.name).toBe('enabled');
      expect(result.dataType).toBe('boolean');
    });
  });

  describe('mode=point, quantity=single 时', () => {
    it('无 semantic 应返回 Input 组件', () => {
      const factor: RuleFactorDefinition = {
        name: 'name',
        title: '名称',
        dataType: 'string',
      };

      const result = inferComponent(factor);

      expect(result.type).toBe('Input');
      expect(result.name).toBe('name');
    });

    it('有 semantic 应返回 Picker 组件', () => {
      const factor: RuleFactorDefinition = {
        name: 'birth_date',
        title: '出生日期',
        dataType: 'string',
        semantic: 'date',
      };

      const result = inferComponent(factor) as { type: string; semantic?: string };

      expect(result.type).toBe('Picker');
      expect(result.semantic).toBe('date');
    });
  });

  describe('mode=point, quantity=multiple 时', () => {
    it('无 semantic 应返回 ListBuilder 组件(item: Input)', () => {
      const factor: RuleFactorDefinition = {
        name: 'emails',
        title: '邮箱列表',
        dataType: 'string',
        quantity: 'multiple',
      };

      const result = inferComponent(factor) as ListBuilderProperties;

      expect(result.type).toBe('ListBuilder');
      expect(result.item.type).toBe('Input');
    });

    it('有 semantic 应返回 ListBuilder 组件(item: Picker)', () => {
      const factor: RuleFactorDefinition = {
        name: 'holidays',
        title: '假期',
        dataType: 'string',
        semantic: 'date',
        quantity: 'multiple',
      };

      const result = inferComponent(factor) as ListBuilderProperties;

      expect(result.type).toBe('ListBuilder');
      expect(result.item.type).toBe('Picker');
    });

    it('应传递 constraints.minItems/maxItems 到 ListBuilder', () => {
      const factor: RuleFactorDefinition = {
        name: 'items',
        title: '项目列表',
        dataType: 'string',
        quantity: 'multiple',
        constraints: { minItems: 1, maxItems: 5 },
      };

      const result = inferComponent(factor) as ListBuilderProperties;

      expect(result.constraints).toBeDefined();
      expect(result.constraints?.minItems).toBe(1);
      expect(result.constraints?.maxItems).toBe(5);
    });
  });

  describe('mode=range, quantity=single 时', () => {
    it('无 semantic 应返回 RangeInput 组件', () => {
      const factor: RuleFactorDefinition = {
        name: 'price',
        title: '价格区间',
        dataType: 'number',
        mode: 'range',
      };

      const result = inferComponent(factor);

      expect(result.type).toBe('RangeInput');
    });

    it('有 semantic 应返回 RangePicker 组件', () => {
      const factor: RuleFactorDefinition = {
        name: 'period',
        title: '时间段',
        dataType: 'string',
        semantic: 'date',
        mode: 'range',
      };

      const result = inferComponent(factor) as { type: string; semantic?: string };

      expect(result.type).toBe('RangePicker');
      expect(result.semantic).toBe('date');
    });
  });

  describe('mode=range, quantity=multiple 时', () => {
    it('无 semantic 应返回 ListRangeBuilder 组件(item: RangeInput)', () => {
      const factor: RuleFactorDefinition = {
        name: 'price_ranges',
        title: '价格区间列表',
        dataType: 'number',
        mode: 'range',
        quantity: 'multiple',
      };

      const result = inferComponent(factor) as ListRangeBuilderProperties;

      expect(result.type).toBe('ListRangeBuilder');
      expect(result.item.type).toBe('RangeInput');
    });

    it('有 semantic 应返回 ListRangeBuilder 组件(item: RangePicker)', () => {
      const factor: RuleFactorDefinition = {
        name: 'time_periods',
        title: '时间段列表',
        dataType: 'string',
        semantic: 'datetime',
        mode: 'range',
        quantity: 'multiple',
      };

      const result = inferComponent(factor) as ListRangeBuilderProperties;

      expect(result.type).toBe('ListRangeBuilder');
      expect(result.item.type).toBe('RangePicker');
    });

    it('应传递 constraints.minItems/maxItems 到 ListRangeBuilder', () => {
      const factor: RuleFactorDefinition = {
        name: 'periods',
        title: '周期',
        dataType: 'number',
        mode: 'range',
        quantity: 'multiple',
        constraints: { minItems: 2, maxItems: 10 },
      };

      const result = inferComponent(factor) as ListRangeBuilderProperties;

      expect(result.constraints).toBeDefined();
      expect(result.constraints?.minItems).toBe(2);
      expect(result.constraints?.maxItems).toBe(10);
    });
  });

  describe('constraints 传递', () => {
    it('应将 constraints 传递到基础属性', () => {
      const factor: RuleFactorDefinition = {
        name: 'age',
        title: '年龄',
        dataType: 'number',
        constraints: { min: 0, max: 150 },
      };

      const result = inferComponent(factor) as InputProperties;

      expect(result.constraints).toBeDefined();
      expect(result.constraints?.min).toBe(0);
      expect(result.constraints?.max).toBe(150);
    });

    it('应将 constraints.precision 传递到 item', () => {
      const factor: RuleFactorDefinition = {
        name: 'prices',
        title: '价格列表',
        dataType: 'number',
        quantity: 'multiple',
        constraints: { min: 0, max: 100, precision: 2 },
      };

      const result = inferComponent(factor) as ListBuilderProperties;

      expect(result.item.constraints?.precision).toBe(2);
    });
  });

  describe('边界情况', () => {
    it('dataType=string + semantic 时应返回 Picker', () => {
      const factor: RuleFactorDefinition = {
        name: 'event',
        title: '事件',
        dataType: 'string',
        semantic: 'date',
      };

      const result = inferComponent(factor);

      expect(result.type).toBe('Picker');
    });

    it('dataType=number + semantic + mode=range 时应返回 RangePicker', () => {
      const factor: RuleFactorDefinition = {
        name: 'rate',
        title: '比率',
        dataType: 'number',
        semantic: 'percentage',
        mode: 'range',
      };

      const result = inferComponent(factor);

      expect(result.type).toBe('RangePicker');
    });
  });
});