import { describe, expect, it, vi } from 'vitest'
import { createRuleWorkspace } from './index'
import { RuleWorkspaceBuilder } from './builder/RuleWorkspaceBuilder'
import { providePaginatedFilterableFetcher } from './fetcher/providePaginatedFilterableFetcher'
import { provideElementaryFetcher } from './fetcher/provideElementaryFetcher'
import type { RuleFactorDefinition } from './dsl'

const factors: readonly RuleFactorDefinition[] = [
  {
    name: 'employee',
    title: '员工',
    dataType: 'string',
    resource: { name: 'Employee', features: ['pagination', 'filter'] },
  },
  {
    name: 'deliver_city',
    title: '目标城市',
    dataType: 'string',
    resource: { name: 'City' },
  },
  {
    name: 'order_amount',
    title: '订单金额',
    dataType: 'number',
    mode: 'range',
    quantity: 'multiple',
  },
  {
    name: 'is_active',
    title: '是否激活',
    dataType: 'boolean',
  },
]

const fetchers = [
  providePaginatedFilterableFetcher('Employee', {
    fetch: vi.fn().mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0 }),
  }),
  provideElementaryFetcher('City', {
    fetch: vi.fn().mockResolvedValue([
      { label: '北京', value: 'bj' },
      { label: '上海', value: 'sh' },
    ]),
  }),
]

describe('End-to-end: create scenario', () => {
  it('completes the full workflow from spec.md usage example', () => {
    const workspace = createRuleWorkspace({ factors, fetchers })

    // addGroup / addRule
    const group = workspace.addGroup('group-1')
    const rule = group.addRule('rule-1')

    // 选择 order_amount
    rule.onFieldChange({ field: 'name', value: 'order_amount' })
    expect(rule.factor.value?.name).toBe('order_amount')
    // number + range + multiple 推断
    expect(rule.operators.value.map((o) => o.value)).toEqual([
      'between any',
      'between all',
      'not between any',
      'not between all',
    ])
    expect(rule.thresholder.value?.type).toBe('ListRangeBuilder')

    // 选择 operator / threshold
    rule.onFieldChange({ field: 'operator', value: 'between any' })
    rule.onFieldChange({ field: 'threshold', value: [[0, 100], [200, 300]] })

    // 验证并构建
    expect(workspace.validate()).toBe(true)
    const result = workspace.build()
    expect(result).toHaveLength(1)
    expect(result[0].rules).toEqual([
      {
        id: 'rule-1',
        name: 'order_amount',
        operator: 'between any',
        threshold: [
          [0, 100],
          [200, 300],
        ],
      },
    ])

    // 销毁
    expect(() => workspace.destroy()).not.toThrow()
    // 重复 destroy 幂等
    expect(() => workspace.destroy()).not.toThrow()
  })

  it('factorOptions excludes the name of an active rule', () => {
    const workspace = createRuleWorkspace({ factors, fetchers })
    const group = workspace.addGroup('group-1')
    const rule = group.addRule('rule-1')
    rule.onFieldChange({ field: 'name', value: 'is_active' })
    const values = group.factorOptions.value.map((o) => o.value)
    expect(values).not.toContain('is_active')
  })

  it('switches factor correctly with full reset', () => {
    const workspace = createRuleWorkspace({ factors, fetchers })
    const group = workspace.addGroup('group-1')
    const rule = group.addRule('rule-1')

    rule.onFieldChange({ field: 'name', value: 'is_active' })
    rule.onFieldChange({ field: 'operator', value: 'is' })
    rule.onFieldChange({ field: 'threshold', value: true })

    // 切换到另一个 factor
    rule.onFieldChange({ field: 'name', value: 'order_amount' })
    expect(rule.operator.value).toBeNull()
    expect(rule.threshold.value).toBeUndefined()
  })
})

describe('End-to-end: edit scenario', () => {
  const editGroups = [
    {
      rules: [
        { id: 'rule-1', name: 'is_active', operator: 'is', threshold: true },
        { id: 'rule-2', name: 'order_amount', operator: 'between any', threshold: [[0, 100]] },
      ],
    },
  ]

  it('restores rules from snapshots', () => {
    const workspace = new RuleWorkspaceBuilder()
      .withFactors(factors)
      .withFetchers(fetchers)
      .withRuleGroups(editGroups)
      .build()

    expect(workspace.snapshots).toHaveLength(1)
    expect(workspace.groups.value).toHaveLength(1)
    const group = workspace.groups.value[0]
    expect(group.rules.value).toHaveLength(2)
    expect(group.rules.value[0].name.value).toBe('is_active')
    expect(group.rules.value[0].operator.value).toBe('is')
    expect(group.rules.value[0].threshold.value).toBe(true)
  })

  it('factorOptions excludes names from snapshot rules', () => {
    const workspace = new RuleWorkspaceBuilder()
      .withFactors(factors)
      .withFetchers(fetchers)
      .withRuleGroups(editGroups)
      .build()

    const group = workspace.groups.value[0]
    const values = group.factorOptions.value.map((o) => o.value)
    expect(values).not.toContain('is_active')
    expect(values).not.toContain('order_amount')
  })

  it('build returns restored data', () => {
    const workspace = new RuleWorkspaceBuilder()
      .withFactors(factors)
      .withFetchers(fetchers)
      .withRuleGroups(editGroups)
      .build()

    const result = workspace.build()
    expect(result[0].rules).toEqual(editGroups[0].rules)
  })

  it('snapshots are immutable when modifying rules', () => {
    const workspace = new RuleWorkspaceBuilder()
      .withFactors(factors)
      .withFetchers(fetchers)
      .withRuleGroups(editGroups)
      .build()

    const snapshot = workspace.snapshots[0]
    const group = workspace.groups.value[0]
    const rule = group.rules.value[0]
    rule.onFieldChange({ field: 'name', value: 'order_amount' })
    // snapshots 不变
    expect(snapshot).toBe(workspace.snapshots[0])
    expect(snapshot.rules[0].name).toBe('is_active')
  })
})

describe('End-to-end: error scenarios', () => {
  it('throws when Fetcher is not registered for dynamic resource', () => {
    const workspace = createRuleWorkspace({ factors: [factors[0]] }) // 缺 fetcher
    const group = workspace.addGroup('group-1')
    const rule = group.addRule('rule-1')
    // 选择 employee（带 dynamic resource）会触发 ThresholderInferrer → ResourceFactory.create
    rule.onFieldChange({ field: 'name', value: 'employee' })
    // thresholder 会求值并抛错
    expect(() => rule.thresholder.value).toThrow(/No FetcherProvider/)
  })

  it('throws when validate false and build is called', () => {
    const workspace = createRuleWorkspace({ factors, fetchers })
    workspace.addGroup('group-1') // 空 group
    expect(() => workspace.build()).toThrow(/incomplete/)
  })

  it('throws when individual rule is incomplete', () => {
    const workspace = createRuleWorkspace({ factors, fetchers })
    const group = workspace.addGroup('group-1')
    group.addRule('rule-1') // 空的 rule
    expect(group.validate()).toBe(false)
    expect(() => group.build()).toThrow(/incomplete/)
  })
})
