import { describe, expect, it } from 'vitest'
import { sampleGroup, sampleRule1, sampleRule2 } from './rules'
import type { AtomicRule, AtomicRuleGroup } from '../dsl'

describe('rules fixtures', () => {
  it('sampleRule1 is assignable to AtomicRule', () => {
    const _check: AtomicRule = sampleRule1
    expect(_check.id).toBe('rule-1')
    expect(_check.name).toBe('employee')
    expect(_check.operator).toBe('eq')
    expect(_check.threshold).toBe(100)
  })

  it('sampleRule2 carries array threshold', () => {
    const _check: AtomicRule = sampleRule2
    expect(Array.isArray(_check.threshold)).toBe(true)
  })

  it('sampleGroup is assignable to AtomicRuleGroup', () => {
    const _check: AtomicRuleGroup = sampleGroup
    expect(_check.rules).toHaveLength(2)
  })
})
