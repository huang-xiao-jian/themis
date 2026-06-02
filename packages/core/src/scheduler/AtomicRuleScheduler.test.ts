import { describe, expect, it } from 'vitest'
import { signal } from '@preact/signals-core'
import { AtomicRuleScheduler } from './AtomicRuleScheduler'
import { ThresholderInferrer } from '../inferrer/ThresholderInferrer'
import { DefaultResourceFactory } from '../factory/ResourceFactory'
import { DefaultStaticResourceFactory } from '../factory/StaticResourceFactory'
import { DefaultDynamicResourceFactory } from '../factory/DynamicResourceFactory'
import { FetcherRegistry } from '../factory/FetcherRegistry'
import { allFactors, booleanFactor } from '../__fixtures__/factors'
import { sampleRule1 } from '../__fixtures__/rules'

function makeInferrer() {
  const factory = new DefaultResourceFactory(
    new DefaultStaticResourceFactory(),
    new DefaultDynamicResourceFactory(new FetcherRegistry())
  )
  return new ThresholderInferrer(factory)
}

function makeFactorsSignal() {
  return signal<readonly typeof allFactors[number][]>(allFactors)
}

describe('AtomicRuleScheduler - creation', () => {
  it('starts with empty name/operator/threshold and null factor', () => {
    const inferrer = makeInferrer()
    const scheduler = new AtomicRuleScheduler('rule-1', makeFactorsSignal(), inferrer)
    expect(scheduler.id).toBe('rule-1')
    expect(scheduler.name.value).toBeNull()
    expect(scheduler.operator.value).toBeNull()
    expect(scheduler.threshold.value).toBeUndefined()
    expect(scheduler.factor.value).toBeNull()
    expect(scheduler.operators.value).toEqual([])
    expect(scheduler.thresholder.value).toBeNull()
  })

  it('restores from snapshot in edit scenario', () => {
    const inferrer = makeInferrer()
    const scheduler = new AtomicRuleScheduler('rule-1', makeFactorsSignal(), inferrer, sampleRule1)
    expect(scheduler.name.value).toBe('employee')
    expect(scheduler.operator.value).toBe('eq')
    expect(scheduler.threshold.value).toBe(100)
    expect(scheduler.factor.value).not.toBeNull()
    expect(scheduler.factor.value?.name).toBe('employee')
  })

  it('subscribe does not reset values during construction (no spurious reset)', () => {
    const inferrer = makeInferrer()
    const scheduler = new AtomicRuleScheduler('rule-1', makeFactorsSignal(), inferrer, sampleRule1)
    // 编辑场景下构造后 operator/threshold 应保持 snapshot 的值
    expect(scheduler.operator.value).toBe('eq')
    expect(scheduler.threshold.value).toBe(100)
  })
})

describe('AtomicRuleScheduler - linkage on name change', () => {
  it('changing name updates factor and triggers operators/thresholder recompute', () => {
    const inferrer = makeInferrer()
    const scheduler = new AtomicRuleScheduler('rule-1', makeFactorsSignal(), inferrer)
    scheduler.onFieldChange({ field: 'name', value: 'is_active' })
    expect(scheduler.factor.value).toEqual(booleanFactor)
    expect(scheduler.operators.value.map((o) => o.value)).toEqual(['is'])
    expect(scheduler.thresholder.value?.type).toBe('Switch')
  })

  it('changing name resets operator and threshold', () => {
    const inferrer = makeInferrer()
    const scheduler = new AtomicRuleScheduler('rule-1', makeFactorsSignal(), inferrer, sampleRule1)
    // 此时 operator=eq, threshold=100
    scheduler.onFieldChange({ field: 'name', value: 'is_active' })
    expect(scheduler.operator.value).toBeNull()
    expect(scheduler.threshold.value).toBeUndefined()
  })

  it('switching name twice clears residual state', () => {
    const inferrer = makeInferrer()
    const scheduler = new AtomicRuleScheduler('rule-1', makeFactorsSignal(), inferrer)
    scheduler.onFieldChange({ field: 'name', value: 'is_active' })
    scheduler.onFieldChange({ field: 'operator', value: 'is' })
    scheduler.onFieldChange({ field: 'threshold', value: true })
    // 切换到另一个 factor
    scheduler.onFieldChange({ field: 'name', value: 'age' })
    expect(scheduler.operator.value).toBeNull()
    expect(scheduler.threshold.value).toBeUndefined()
  })
})

describe('AtomicRuleScheduler - operator/threshold updates', () => {
  it('setting operator updates signal', () => {
    const inferrer = makeInferrer()
    const scheduler = new AtomicRuleScheduler('rule-1', makeFactorsSignal(), inferrer)
    scheduler.onFieldChange({ field: 'name', value: 'is_active' })
    scheduler.onFieldChange({ field: 'operator', value: 'is' })
    expect(scheduler.operator.value).toBe('is')
  })

  it('setting threshold updates signal', () => {
    const inferrer = makeInferrer()
    const scheduler = new AtomicRuleScheduler('rule-1', makeFactorsSignal(), inferrer)
    scheduler.onFieldChange({ field: 'name', value: 'is_active' })
    scheduler.onFieldChange({ field: 'operator', value: 'is' })
    scheduler.onFieldChange({ field: 'threshold', value: false })
    expect(scheduler.threshold.value).toBe(false)
  })

  it('setting same name does not trigger reset', () => {
    const inferrer = makeInferrer()
    const scheduler = new AtomicRuleScheduler('rule-1', makeFactorsSignal(), inferrer)
    scheduler.onFieldChange({ field: 'name', value: 'is_active' })
    scheduler.onFieldChange({ field: 'operator', value: 'is' })
    scheduler.onFieldChange({ field: 'threshold', value: true })
    // 再次设置同名
    scheduler.onFieldChange({ field: 'name', value: 'is_active' })
    expect(scheduler.operator.value).toBe('is')
    expect(scheduler.threshold.value).toBe(true)
  })
})

describe('AtomicRuleScheduler - validate & build', () => {
  it('validate returns false when incomplete', () => {
    const inferrer = makeInferrer()
    const scheduler = new AtomicRuleScheduler('rule-1', makeFactorsSignal(), inferrer)
    expect(scheduler.validate()).toBe(false)
  })

  it('validate returns false when threshold is undefined', () => {
    const inferrer = makeInferrer()
    const scheduler = new AtomicRuleScheduler('rule-1', makeFactorsSignal(), inferrer)
    scheduler.onFieldChange({ field: 'name', value: 'is_active' })
    scheduler.onFieldChange({ field: 'operator', value: 'is' })
    // 故意不设置 threshold
    expect(scheduler.validate()).toBe(false)
  })

  it('validate returns true when all fields are set', () => {
    const inferrer = makeInferrer()
    const scheduler = new AtomicRuleScheduler('rule-1', makeFactorsSignal(), inferrer)
    scheduler.onFieldChange({ field: 'name', value: 'is_active' })
    scheduler.onFieldChange({ field: 'operator', value: 'is' })
    scheduler.onFieldChange({ field: 'threshold', value: true })
    expect(scheduler.validate()).toBe(true)
  })

  it('build throws when incomplete', () => {
    const inferrer = makeInferrer()
    const scheduler = new AtomicRuleScheduler('rule-1', makeFactorsSignal(), inferrer)
    expect(() => scheduler.build()).toThrow(/not complete/)
  })

  it('build returns AtomicRule when complete', () => {
    const inferrer = makeInferrer()
    const scheduler = new AtomicRuleScheduler('rule-1', makeFactorsSignal(), inferrer)
    scheduler.onFieldChange({ field: 'name', value: 'is_active' })
    scheduler.onFieldChange({ field: 'operator', value: 'is' })
    scheduler.onFieldChange({ field: 'threshold', value: true })
    const rule = scheduler.build()
    expect(rule).toEqual({
      id: 'rule-1',
      name: 'is_active',
      operator: 'is',
      threshold: true,
    })
  })
})

describe('AtomicRuleScheduler - destroy', () => {
  it('destroy is idempotent', () => {
    const inferrer = makeInferrer()
    const scheduler = new AtomicRuleScheduler('rule-1', makeFactorsSignal(), inferrer)
    scheduler.destroy()
    expect(() => scheduler.destroy()).not.toThrow()
  })

  it('destroy prevents further onFieldChange writes (no effect)', () => {
    const inferrer = makeInferrer()
    const scheduler = new AtomicRuleScheduler('rule-1', makeFactorsSignal(), inferrer)
    scheduler.destroy()
    // destroy 后 onFieldChange 不再生效（防误操作）
    scheduler.onFieldChange({ field: 'name', value: 'is_active' })
    expect(scheduler.name.value).toBeNull()
  })
})
