import { describe, expect, it } from 'vitest'
import { FactorOptionsInferrer } from './FactorOptionsInferrer'
import { allFactors } from '../__fixtures__/factors'

describe('FactorOptionsInferrer', () => {
  const inferrer = new FactorOptionsInferrer()

  it('returns all factors when used set is empty', () => {
    const result = inferrer.infer(allFactors, new Set())
    expect(result).toHaveLength(allFactors.length)
    expect(result[0]).toEqual({ label: allFactors[0].title, value: allFactors[0].name })
  })

  it('excludes factors whose name is in used set', () => {
    const used = new Set(['is_active', 'employee'])
    const result = inferrer.infer(allFactors, used)
    expect(result.find((o) => o.value === 'is_active')).toBeUndefined()
    expect(result.find((o) => o.value === 'employee')).toBeUndefined()
    expect(result.length).toBe(allFactors.length - 2)
  })

  it('returns empty when all factors are used', () => {
    const used = new Set(allFactors.map((f) => f.name))
    expect(inferrer.infer(allFactors, used)).toEqual([])
  })

  it('preserves input order', () => {
    const used = new Set(['is_active'])
    const result = inferrer.infer(allFactors, used)
    const names = result.map((o) => o.value)
    const expectedNames = allFactors.filter((f) => f.name !== 'is_active').map((f) => f.name)
    expect(names).toEqual(expectedNames)
  })

  it('label comes from title', () => {
    const result = inferrer.infer(allFactors, new Set())
    const employee = result.find((o) => o.value === 'employee')
    expect(employee?.label).toBe('员工')
  })
})
