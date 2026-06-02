import { describe, expect, it } from 'vitest'
import { signal } from '@preact/signals-core'
import { AtomicRuleGroupScheduler } from './AtomicRuleGroupScheduler'
import { AtomicRuleScheduler } from './AtomicRuleScheduler'
import { ThresholderInferrer } from '../inferrer/ThresholderInferrer'
import { DefaultResourceFactory } from '../factory/ResourceFactory'
import { DefaultStaticResourceFactory } from '../factory/StaticResourceFactory'
import { DefaultDynamicResourceFactory } from '../factory/DynamicResourceFactory'
import { FetcherRegistry } from '../factory/FetcherRegistry'
import { allFactors, booleanFactor } from '../__fixtures__/factors'
import { sampleGroup } from '../__fixtures__/rules'

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

describe('AtomicRuleGroupScheduler - create & lifecycle', () => {
  it('starts with empty rules and full factorOptions', () => {
    const inferrer = makeInferrer()
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer)
    expect(group.id).toBe('group-1')
    expect(group.rules.value).toEqual([])
    expect(group.factorOptions.value).toHaveLength(allFactors.length)
    expect(group.snapshots).toEqual([])
  })

  it('restores rules from snapshot in edit scenario', () => {
    const inferrer = makeInferrer()
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer, sampleGroup)
    expect(group.snapshots).toHaveLength(2)
    expect(group.rules.value).toHaveLength(2)
    expect(group.rules.value[0]).toBeInstanceOf(AtomicRuleScheduler)
    expect(group.rules.value[0].id).toBe('rule-1')
  })

  it('factorOptions excludes names from current rules', () => {
    const inferrer = makeInferrer()
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer, sampleGroup)
    // sampleGroup 的两个 rule 分别用了 employee 和 deliver_city
    const usedNames = group.factorOptions.value.map((o) => o.value)
    expect(usedNames).not.toContain('employee')
    expect(usedNames).not.toContain('deliver_city')
  })
})

describe('AtomicRuleGroupScheduler - addRule/removeRule', () => {
  it('addRule appends a new rule scheduler', () => {
    const inferrer = makeInferrer()
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer)
    const rule = group.addRule('rule-1')
    expect(group.rules.value).toHaveLength(1)
    expect(rule).toBeInstanceOf(AtomicRuleScheduler)
    expect(group.rules.value[0]).toBe(rule)
  })

  it('removeRule removes the scheduler and destroys it', () => {
    const inferrer = makeInferrer()
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer)
    const rule = group.addRule('rule-1')
    group.removeRule('rule-1')
    expect(group.rules.value).toEqual([])
    // destroy 幂等
    expect(() => rule.destroy()).not.toThrow()
  })

  it('removeRule on non-existent id is a no-op', () => {
    const inferrer = makeInferrer()
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer)
    group.addRule('rule-1')
    expect(() => group.removeRule('rule-999')).not.toThrow()
    expect(group.rules.value).toHaveLength(1)
  })

  it('factorOptions updates reactively when rule name changes', () => {
    const inferrer = makeInferrer()
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer)
    const rule = group.addRule('rule-1')
    // 设置 rule.name 后 factorOptions 应该排除该因子
    rule.onFieldChange({ field: 'name', value: 'is_active' })
    const usedNames = group.factorOptions.value.map((o) => o.value)
    expect(usedNames).not.toContain('is_active')
  })

  it('factorOptions restores when rule is removed', () => {
    const inferrer = makeInferrer()
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer)
    const rule = group.addRule('rule-1')
    rule.onFieldChange({ field: 'name', value: 'is_active' })
    expect(group.factorOptions.value.find((o) => o.value === 'is_active')).toBeUndefined()
    group.removeRule('rule-1')
    expect(group.factorOptions.value.find((o) => o.value === 'is_active')).toBeDefined()
  })
})

describe('AtomicRuleGroupScheduler - validate & build', () => {
  it('validate returns false when no rules', () => {
    const inferrer = makeInferrer()
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer)
    expect(group.validate()).toBe(false)
  })

  it('validate returns false when any rule is incomplete', () => {
    const inferrer = makeInferrer()
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer)
    const rule = group.addRule('rule-1')
    rule.onFieldChange({ field: 'name', value: 'is_active' })
    rule.onFieldChange({ field: 'operator', value: 'is' })
    // threshold 未设置
    expect(group.validate()).toBe(false)
  })

  it('validate returns true when all rules are complete', () => {
    const inferrer = makeInferrer()
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer)
    const rule = group.addRule('rule-1')
    rule.onFieldChange({ field: 'name', value: 'is_active' })
    rule.onFieldChange({ field: 'operator', value: 'is' })
    rule.onFieldChange({ field: 'threshold', value: true })
    expect(group.validate()).toBe(true)
  })

  it('build throws when incomplete', () => {
    const inferrer = makeInferrer()
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer)
    expect(() => group.build()).toThrow(/incomplete/)
  })

  it('build returns AtomicRuleGroup when complete', () => {
    const inferrer = makeInferrer()
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer)
    const rule = group.addRule('rule-1')
    rule.onFieldChange({ field: 'name', value: 'is_active' })
    rule.onFieldChange({ field: 'operator', value: 'is' })
    rule.onFieldChange({ field: 'threshold', value: true })
    const result = group.build()
    expect(result.rules).toEqual([
      { id: 'rule-1', name: 'is_active', operator: 'is', threshold: true },
    ])
  })
})

describe('AtomicRuleGroupScheduler - destroy', () => {
  it('destroy releases all child rules', () => {
    const inferrer = makeInferrer()
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer)
    const r1 = group.addRule('rule-1')
    const r2 = group.addRule('rule-2')
    group.destroy()
    expect(group.rules.value).toEqual([])
    expect(() => r1.destroy()).not.toThrow()
    expect(() => r2.destroy()).not.toThrow()
  })

  it('destroy is idempotent', () => {
    const inferrer = makeInferrer()
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer)
    group.destroy()
    expect(() => group.destroy()).not.toThrow()
  })

  it('addRule throws after destroy', () => {
    const inferrer = makeInferrer()
    const group = new AtomicRuleGroupScheduler('group-1', makeFactorsSignal(), inferrer)
    group.destroy()
    expect(() => group.addRule('rule-1')).toThrow(/destroyed/)
  })
})

// suppress unused
void booleanFactor
