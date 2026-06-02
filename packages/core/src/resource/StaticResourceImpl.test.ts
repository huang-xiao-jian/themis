import { describe, expect, it, vi } from 'vitest'
import { StaticResourceImpl } from './StaticResourceImpl'

describe('StaticResourceImpl', () => {
  const options = [
    { label: '北京', value: 'bj' },
    { label: '上海', value: 'sh' },
    { label: '广州', value: 'gz' },
  ]

  it('exposes name and initial options signal', () => {
    const resource = new StaticResourceImpl('City', options)
    expect(resource.name).toBe('City')
    expect(resource.options.value).toEqual(options)
  })

  it('onFiltrate narrows options to matching value', () => {
    const resource = new StaticResourceImpl('City', options)
    resource.onFiltrate('sh')
    expect(resource.options.value).toEqual([{ label: '上海', value: 'sh' }])
  })

  it('onFiltrate yields empty when value not found', () => {
    const resource = new StaticResourceImpl('City', options)
    resource.onFiltrate('unknown')
    expect(resource.options.value).toEqual([])
  })

  it('handles empty options list', () => {
    const resource = new StaticResourceImpl('Empty', [])
    expect(resource.options.value).toEqual([])
    resource.onFiltrate('x')
    expect(resource.options.value).toEqual([])
  })

  it('does not mutate input array', () => {
    const input = [...options]
    new StaticResourceImpl('City', input)
    expect(input).toEqual(options)
    // suppress unused
    void vi
  })
})
