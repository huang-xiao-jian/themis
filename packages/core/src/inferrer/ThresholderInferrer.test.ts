import { describe, expect, it } from 'vitest'
import { ThresholderInferrer } from './ThresholderInferrer'
import { DefaultResourceFactory } from '../factory/ResourceFactory'
import { DefaultStaticResourceFactory } from '../factory/StaticResourceFactory'
import { DefaultDynamicResourceFactory } from '../factory/DynamicResourceFactory'
import { FetcherRegistry } from '../factory/FetcherRegistry'
import {
  booleanFactor,
  dateRangeSingleFactor,
  numberPointMultipleFactor,
  numberPointSingleFactor,
  numberRangeMultipleFactor,
  numberRangeSingleFactor,
  staticResourceFactor,
  stringLongTextFactor,
  stringPointMultipleFactor,
  stringPointSingleFactor,
  stringShortTextFactor,
  dynamicResourceFactor,
} from '../__fixtures__/factors'
import { provideElementaryFetcher } from '../fetcher/provideElementaryFetcher'
import { providePaginatedFilterableFetcher } from '../fetcher/providePaginatedFilterableFetcher'
import type { ThresholdComponentProperties } from '../component/ThresholdComponentProperties'

function makeInferrer(registry: FetcherRegistry = new FetcherRegistry()) {
  const factory = new DefaultResourceFactory(
    new DefaultStaticResourceFactory(),
    new DefaultDynamicResourceFactory(registry)
  )
  return new ThresholderInferrer(factory)
}

describe('ThresholderInferrer - decision tree coverage', () => {
  it('boolean → Switch', () => {
    const inferrer = makeInferrer()
    const result = inferrer.infer(booleanFactor) as { type: string }
    expect(result.type).toBe('Switch')
  })

  it('string + point + single (max<=100) → Input', () => {
    const inferrer = makeInferrer()
    const result = inferrer.infer(stringShortTextFactor) as { type: string }
    expect(result.type).toBe('Input')
  })

  it('string + point + single (max>100) → TextArea', () => {
    const inferrer = makeInferrer()
    const result = inferrer.infer(stringLongTextFactor) as { type: string }
    expect(result.type).toBe('TextArea')
  })

  it('number + point + single → Input (with step/precision constraints)', () => {
    const inferrer = makeInferrer()
    const result = inferrer.infer({
      ...numberPointSingleFactor,
      constraints: { step: 0.01, precision: 2 },
    }) as { type: string; constraints?: { step?: number; precision?: number } }
    expect(result.type).toBe('Input')
    expect(result.constraints?.step).toBe(0.01)
    expect(result.constraints?.precision).toBe(2)
  })

  it('string + point + multiple → ListBuilder with item.type=Input', () => {
    const inferrer = makeInferrer()
    const result = inferrer.infer(stringPointMultipleFactor) as {
      type: string
      item: { type: string }
    }
    expect(result.type).toBe('ListBuilder')
    expect(result.item.type).toBe('Input')
  })

  it('number + point + multiple → ListBuilder with item.type=Input', () => {
    const inferrer = makeInferrer()
    const result = inferrer.infer(numberPointMultipleFactor) as {
      type: string
      item: { type: string }
    }
    expect(result.type).toBe('ListBuilder')
    expect(result.item.type).toBe('Input')
  })

  it('number + range + single (manual) → RangeInput', () => {
    const inferrer = makeInferrer()
    const result = inferrer.infer(numberRangeSingleFactor) as { type: string }
    expect(result.type).toBe('RangeInput')
  })

  it('number + range + multiple (manual) → ListRangeBuilder with item.type=RangeInput', () => {
    const inferrer = makeInferrer()
    const result = inferrer.infer(numberRangeMultipleFactor) as {
      type: string
      item: { type: string }
    }
    expect(result.type).toBe('ListRangeBuilder')
    expect(result.item.type).toBe('RangeInput')
  })

  it('date + range + single (auto) → RangePicker', () => {
    const inferrer = makeInferrer()
    const result = inferrer.infer(dateRangeSingleFactor) as { type: string }
    expect(result.type).toBe('RangePicker')
  })

  it('date + point + single (auto) → Picker', () => {
    const inferrer = makeInferrer()
    const result = inferrer.infer({
      name: 'visit_date',
      title: '访问日期',
      dataType: 'number',
      semantic: 'date',
      mode: 'point',
      quantity: 'single',
    }) as { type: string }
    expect(result.type).toBe('Picker')
  })

  it('date + point + multiple (auto) → ListBuilder with item.type=Picker', () => {
    const inferrer = makeInferrer()
    const result = inferrer.infer({
      name: 'visit_date',
      title: '访问日期',
      dataType: 'number',
      semantic: 'date',
      mode: 'point',
      quantity: 'multiple',
    }) as { type: string; item: { type: string } }
    expect(result.type).toBe('ListBuilder')
    expect(result.item.type).toBe('Picker')
  })

  it('date + range + multiple (auto) → ListRangeBuilder with item.type=RangePicker', () => {
    const inferrer = makeInferrer()
    const result = inferrer.infer({
      name: 'visit_date',
      title: '访问日期',
      dataType: 'number',
      semantic: 'date',
      mode: 'range',
      quantity: 'multiple',
    }) as { type: string; item: { type: string } }
    expect(result.type).toBe('ListRangeBuilder')
    expect(result.item.type).toBe('RangePicker')
  })

  it('static resource + single → Select with resource', () => {
    const inferrer = makeInferrer()
    const result = inferrer.infer(staticResourceFactor) as {
      type: string
      resource: { name: string }
    }
    expect(result.type).toBe('Select')
    expect(result.resource.name).toBe('City')
  })

  it('static resource + multiple → MultipleSelect with resource', () => {
    const inferrer = makeInferrer()
    const result = inferrer.infer({
      ...staticResourceFactor,
      quantity: 'multiple',
    }) as { type: string; resource: { name: string } }
    expect(result.type).toBe('MultipleSelect')
    expect(result.resource.name).toBe('City')
  })

  it('dynamic resource + single (elementary) → Select with ElementaryDynamicResource', () => {
    const registry = new FetcherRegistry()
    registry.register(
      provideElementaryFetcher('Employee', { fetch: () => Promise.resolve([]) })
    )
    const inferrer = makeInferrer(registry)
    const factor = {
      name: 'employee_dyn',
      title: '员工',
      dataType: 'string',
      resource: { name: 'Employee' },
    } as const
    const result = inferrer.infer(factor) as { type: string; resource: { name: string } }
    expect(result.type).toBe('Select')
    expect(result.resource.name).toBe('Employee')
  })

  it('ListBuilder pulls minItems/maxItems to list-level constraints', () => {
    const inferrer = makeInferrer()
    const result = inferrer.infer({
      ...stringPointMultipleFactor,
      constraints: { minItems: 1, maxItems: 5 },
    }) as { type: string; constraints?: { minItems?: number; maxItems?: number } }
    expect(result.type).toBe('ListBuilder')
    expect(result.constraints?.minItems).toBe(1)
    expect(result.constraints?.maxItems).toBe(5)
  })

  it('ListBuilder item does not carry minItems/maxItems', () => {
    const inferrer = makeInferrer()
    const result = inferrer.infer({
      ...stringPointMultipleFactor,
      constraints: { minItems: 1, maxItems: 5, max: 50 },
    }) as { type: string; item: { type: string; constraints?: unknown } }
    expect(result.type).toBe('ListBuilder')
    // 列表项不应包含 minItems/maxItems
    const item = result.item as { constraints?: Record<string, unknown> }
    expect(item.constraints).toBeDefined()
    expect((item.constraints as Record<string, unknown>).minItems).toBeUndefined()
    expect((item.constraints as Record<string, unknown>).maxItems).toBeUndefined()
  })
})

describe('ThresholderInferrer - registry wiring', () => {
  it('throws when dynamic resource has no registered Fetcher', () => {
    const inferrer = makeInferrer()
    expect(() => inferrer.infer(dynamicResourceFactor)).toThrow(/No FetcherProvider/)
  })

  it('accepts paginatedFilterable Fetcher for dynamic resource', () => {
    const registry = new FetcherRegistry()
    registry.register(
      providePaginatedFilterableFetcher('Employee', {
        fetch: () => Promise.resolve({ data: [], page: 1, pageSize: 20, total: 0 }),
      })
    )
    const inferrer = makeInferrer(registry)
    const result = inferrer.infer(dynamicResourceFactor) as ThresholdComponentProperties
    expect(result.type).toBe('Select')
  })
})
