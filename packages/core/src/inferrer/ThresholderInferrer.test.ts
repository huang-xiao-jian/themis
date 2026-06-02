import { describe, expect, it } from 'vitest';
import {
  BOOLEAN_FACTOR,
  DATE_RANGE_SINGLE_FACTOR,
  DYNAMIC_RESOURCE_FACTOR,
  NUMBER_POINT_MULTIPLE_FACTOR,
  NUMBER_POINT_SINGLE_FACTOR,
  NUMBER_RANGE_MULTIPLE_FACTOR,
  NUMBER_RANGE_SINGLE_FACTOR,
  STATIC_RESOURCE_FACTOR,
  STRING_LONG_TEXT_FACTOR,
  STRING_POINT_MULTIPLE_FACTOR,
  STRING_SHORT_TEXT_FACTOR,
} from '../__fixtures__/factors';
import type { ThresholdComponentProperties } from '../component/ThresholdComponentProperties';
import { DataType } from '../dsl/DataType';
import { Mode } from '../dsl/Mode';
import { Quantity } from '../dsl/Quantity';
import { Semantic } from '../dsl/Semantic';
import { DefaultDynamicResourceFactory } from '../factory/DynamicResourceFactory';
import { FetcherRegistry } from '../factory/FetcherRegistry';
import { DefaultResourceFactory } from '../factory/ResourceFactory';
import { DefaultStaticResourceFactory } from '../factory/StaticResourceFactory';
import { provideElementaryFetcher } from '../fetcher/provideElementaryFetcher';
import { providePaginatedFilterableFetcher } from '../fetcher/providePaginatedFilterableFetcher';
import { ThresholderInferrer } from './ThresholderInferrer';

function makeInferrer(registry: FetcherRegistry = new FetcherRegistry()) {
  const factory = new DefaultResourceFactory(
    new DefaultStaticResourceFactory(),
    new DefaultDynamicResourceFactory(registry)
  );
  return new ThresholderInferrer(factory);
}

describe('ThresholderInferrer - decision tree coverage', () => {
  it('boolean → Switch', () => {
    const inferrer = makeInferrer();
    const result = inferrer.infer(BOOLEAN_FACTOR) as { type: string };
    expect(result.type).toBe('Switch');
  });

  it('string + point + single (max<=100) → Input', () => {
    const inferrer = makeInferrer();
    const result = inferrer.infer(STRING_SHORT_TEXT_FACTOR) as { type: string };
    expect(result.type).toBe('Input');
  });

  it('string + point + single (max>100) → TextArea', () => {
    const inferrer = makeInferrer();
    const result = inferrer.infer(STRING_LONG_TEXT_FACTOR) as { type: string };
    expect(result.type).toBe('TextArea');
  });

  it('number + point + single → InputNumber (with step/precision constraints)', () => {
    const inferrer = makeInferrer();
    const result = inferrer.infer({
      ...NUMBER_POINT_SINGLE_FACTOR,
      constraints: { step: 0.01, precision: 2 },
    }) as { type: string; constraints?: { step?: number; precision?: number } };
    expect(result.type).toBe('InputNumber');
    expect(result.constraints?.step).toBe(0.01);
    expect(result.constraints?.precision).toBe(2);
  });

  it('string + point + multiple → ListBuilder with item.type=Input', () => {
    const inferrer = makeInferrer();
    const result = inferrer.infer(STRING_POINT_MULTIPLE_FACTOR) as {
      type: string;
      item: { type: string };
    };
    expect(result.type).toBe('ListBuilder');
    expect(result.item.type).toBe('Input');
  });

  it('number + point + multiple → ListBuilder with item.type=InputNumber', () => {
    const inferrer = makeInferrer();
    const result = inferrer.infer(NUMBER_POINT_MULTIPLE_FACTOR) as {
      type: string;
      item: { type: string };
    };
    expect(result.type).toBe('ListBuilder');
    expect(result.item.type).toBe('InputNumber');
  });

  it('number + range + single (manual) → RangeInput', () => {
    const inferrer = makeInferrer();
    const result = inferrer.infer(NUMBER_RANGE_SINGLE_FACTOR) as { type: string };
    expect(result.type).toBe('RangeInput');
  });

  it('number + range + multiple (manual) → ListRangeBuilder with item.type=RangeInput', () => {
    const inferrer = makeInferrer();
    const result = inferrer.infer(NUMBER_RANGE_MULTIPLE_FACTOR) as {
      type: string;
      item: { type: string };
    };
    expect(result.type).toBe('ListRangeBuilder');
    expect(result.item.type).toBe('RangeInput');
  });

  it('date + range + single (auto) → RangePicker', () => {
    const inferrer = makeInferrer();
    const result = inferrer.infer(DATE_RANGE_SINGLE_FACTOR) as { type: string };
    expect(result.type).toBe('RangePicker');
  });

  it('date + point + single (auto) → Picker', () => {
    const inferrer = makeInferrer();
    const result = inferrer.infer({
      name: 'visit_date',
      title: '访问日期',
      dataType: DataType.NUMBER,
      semantic: Semantic.DATE,
      mode: Mode.POINT,
      quantity: Quantity.SINGLE,
    }) as { type: string };
    expect(result.type).toBe('Picker');
  });

  it('date + point + multiple (auto) → ListBuilder with item.type=Picker', () => {
    const inferrer = makeInferrer();
    const result = inferrer.infer({
      name: 'visit_date',
      title: '访问日期',
      dataType: DataType.NUMBER,
      semantic: Semantic.DATE,
      mode: Mode.POINT,
      quantity: Quantity.MULTIPLE,
    }) as { type: string; item: { type: string } };
    expect(result.type).toBe('ListBuilder');
    expect(result.item.type).toBe('Picker');
  });

  it('date + range + multiple (auto) → ListRangeBuilder with item.type=RangePicker', () => {
    const inferrer = makeInferrer();
    const result = inferrer.infer({
      name: 'visit_date',
      title: '访问日期',
      dataType: DataType.NUMBER,
      semantic: Semantic.DATE,
      mode: Mode.RANGE,
      quantity: Quantity.MULTIPLE,
    }) as { type: string; item: { type: string } };
    expect(result.type).toBe('ListRangeBuilder');
    expect(result.item.type).toBe('RangePicker');
  });

  it('static resource + single → Select with resource', () => {
    const inferrer = makeInferrer();
    const result = inferrer.infer(STATIC_RESOURCE_FACTOR) as {
      type: string;
      resource: { name: string };
    };
    expect(result.type).toBe('Select');
    expect(result.resource.name).toBe('City');
  });

  it('static resource + multiple → MultipleSelect with resource', () => {
    const inferrer = makeInferrer();
    const result = inferrer.infer({
      ...STATIC_RESOURCE_FACTOR,
      quantity: Quantity.MULTIPLE,
    }) as { type: string; resource: { name: string } };
    expect(result.type).toBe('MultipleSelect');
    expect(result.resource.name).toBe('City');
  });

  it('dynamic resource + single (elementary) → Select with ElementaryDynamicResource', () => {
    const registry = new FetcherRegistry();
    registry.register(provideElementaryFetcher({ fetch: () => Promise.resolve([]) }));
    const inferrer = makeInferrer(registry);
    const factor = {
      name: 'employee_dyn',
      title: '员工',
      dataType: DataType.STRING,
      resource: { name: 'Employee' },
    } as const;
    const result = inferrer.infer(factor) as { type: string; resource: { name: string } };
    expect(result.type).toBe('Select');
    expect(result.resource.name).toBe('Employee');
  });

  it('ListBuilder pulls minItems/maxItems to list-level constraints', () => {
    const inferrer = makeInferrer();
    const result = inferrer.infer({
      ...STRING_POINT_MULTIPLE_FACTOR,
      constraints: { minItems: 1, maxItems: 5 },
    }) as { type: string; constraints?: { minItems?: number; maxItems?: number } };
    expect(result.type).toBe('ListBuilder');
    expect(result.constraints?.minItems).toBe(1);
    expect(result.constraints?.maxItems).toBe(5);
  });

  it('ListBuilder item does not carry minItems/maxItems', () => {
    const inferrer = makeInferrer();
    const result = inferrer.infer({
      ...STRING_POINT_MULTIPLE_FACTOR,
      constraints: { minItems: 1, maxItems: 5, max: 50 },
    }) as { type: string; item: { type: string; constraints?: unknown } };
    expect(result.type).toBe('ListBuilder');
    // 列表项不应包含 minItems/maxItems
    const item = result.item as { constraints?: Record<string, unknown> };
    expect(item.constraints).toBeDefined();
    expect((item.constraints as Record<string, unknown>).minItems).toBeUndefined();
    expect((item.constraints as Record<string, unknown>).maxItems).toBeUndefined();
  });
});

describe('ThresholderInferrer - registry wiring', () => {
  it('throws when dynamic resource has no registered Fetcher', () => {
    const inferrer = makeInferrer();
    expect(() => inferrer.infer(DYNAMIC_RESOURCE_FACTOR)).toThrow(/paginatedFilterable/);
  });

  it('accepts paginatedFilterable Fetcher for dynamic resource', () => {
    const registry = new FetcherRegistry();
    registry.register(
      providePaginatedFilterableFetcher({
        fetch: () => Promise.resolve({ data: [], page: 1, pageSize: 20, total: 0 }),
      })
    );
    const inferrer = makeInferrer(registry);
    const result = inferrer.infer(DYNAMIC_RESOURCE_FACTOR) as ThresholdComponentProperties;
    expect(result.type).toBe('Select');
  });
});
