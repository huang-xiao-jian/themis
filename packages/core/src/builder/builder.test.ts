import { describe, expect, it, vi } from 'vitest'
import { RuleWorkspaceBuilder } from './RuleWorkspaceBuilder'
import { createRuleWorkspace } from './createRuleWorkspace'
import { allFactors } from '../__fixtures__/factors'
import { providePaginatedFilterableFetcher } from '../fetcher/providePaginatedFilterableFetcher'
import { sampleGroup } from '../__fixtures__/rules'
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition'

describe('RuleWorkspaceBuilder', () => {
  it('builds a workspace in create scenario', () => {
    const workspace = new RuleWorkspaceBuilder().withFactors(allFactors).build()
    expect(workspace.groups.value).toEqual([])
    expect(workspace.snapshots).toEqual([])
    expect(workspace.validate()).toBe(false)
  })

  it('builds a workspace in edit scenario with snapshots', () => {
    const workspace = new RuleWorkspaceBuilder()
      .withFactors(allFactors)
      .withRuleGroups([sampleGroup])
      .build()
    expect(workspace.snapshots).toHaveLength(1)
    expect(workspace.groups.value).toHaveLength(1)
  })

  it('withFactors is overridable', () => {
    const workspace = new RuleWorkspaceBuilder()
      .withFactors([])
      .withFactors(allFactors)
      .build()
    // 通过 addGroup + addRule + 设置 name 验证 factors 已生效
    const group = workspace.addGroup('g-1')
    const rule = group.addRule('rule-1')
    rule.onFieldChange({ field: 'name', value: 'is_active' })
    expect(rule.factor.value?.name).toBe('is_active')
  })

  it('withFetchers registers providers in the internal registry', () => {
    const fetcher = providePaginatedFilterableFetcher('Employee', {
      fetch: vi.fn().mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0 }),
    })
    // 创建包含 dynamic resource 的 factor
    const factors: readonly RuleFactorDefinition[] = [
      ...allFactors,
      {
        name: 'employee_dyn',
        title: '员工',
        dataType: 'string',
        resource: { name: 'Employee', features: ['pagination', 'filter'] as const },
      },
    ]
    const workspace = new RuleWorkspaceBuilder()
      .withFactors(factors)
      .withFetchers([fetcher])
      .build()
    const group = workspace.addGroup('g-1')
    const rule = group.addRule('rule-1')
    rule.onFieldChange({ field: 'name', value: 'employee_dyn' })
    // 不抛错即表示 fetcher 已成功注册
    expect(rule.thresholder.value?.type).toBe('Select')
  })

  it('build twice returns different instances', () => {
    const builder = new RuleWorkspaceBuilder().withFactors(allFactors)
    const ws1 = builder.build()
    builder.withFactors(allFactors)
    const ws2 = builder.build()
    expect(ws1).not.toBe(ws2)
  })
})

describe('createRuleWorkspace', () => {
  it('equivalent to builder with only factors', () => {
    const ws = createRuleWorkspace({ factors: allFactors })
    expect(ws.groups.value).toEqual([])
  })

  it('supports fetchers and ruleGroups', () => {
    const fetcher = providePaginatedFilterableFetcher('Employee', {
      fetch: vi.fn().mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0 }),
    })
    const ws = createRuleWorkspace({
      factors: allFactors,
      fetchers: [fetcher],
      ruleGroups: [sampleGroup],
    })
    expect(ws.snapshots).toHaveLength(1)
    expect(ws.groups.value).toHaveLength(1)
  })

  it('omits optional fields cleanly', () => {
    const ws = createRuleWorkspace({ factors: allFactors })
    expect(ws.snapshots).toEqual([])
  })
})
