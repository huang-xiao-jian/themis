import { assert, describe, expect, it, vi } from 'vitest';
import { ALL_FACTORS } from '../__fixtures__/factors';
import { SAMPLE_GROUP } from '../__fixtures__/rules';
import { DataType } from '../dsl/DataType';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import { providePaginatedFilterableFetcher } from '../fetcher/providePaginatedFilterableFetcher';
import { RuleWorkspaceBuilder } from './RuleWorkspaceBuilder';
import { createRuleWorkspace } from './createRuleWorkspace';

describe('RuleWorkspaceBuilder', () => {
  it('builds a workspace in create scenario', () => {
    const workspace = new RuleWorkspaceBuilder().withFactors(ALL_FACTORS).build();
    expect(workspace.groups.value).toEqual([]);
    expect(workspace.snapshots).toEqual([]);
    expect(workspace.validate()).toBe(false);
  });

  it('builds a workspace in edit scenario with snapshots', () => {
    const workspace = new RuleWorkspaceBuilder()
      .withFactors(ALL_FACTORS)
      .withRuleGroups([SAMPLE_GROUP])
      .build();
    expect(workspace.snapshots).toHaveLength(1);
    expect(workspace.groups.value).toHaveLength(1);
  });

  it('withFactors is overridable', () => {
    const workspace = new RuleWorkspaceBuilder().withFactors([]).withFactors(ALL_FACTORS).build();
    // 通过 addGroup + addRule + 设置 name 验证 factors 已生效
    const group = workspace.addGroup()!;
    const rule = group.addRule()!;
    // Must create fields to activate reactions
    rule.form.createField({ name: 'name' });
    rule.form.createField({ name: 'operator' });
    rule.form.createField({ name: 'threshold' });
    rule.form.setValues({ name: 'is_active' });
    expect(rule.factor.value?.name).toBe('is_active');
  });

  it('withFetchers registers providers in the internal registry', () => {
    const fetcher = providePaginatedFilterableFetcher({
      fetch: vi.fn().mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0 }),
    });
    // 创建包含 dynamic resource 的 factor
    const factors: readonly RuleFactorDefinition[] = [
      ...ALL_FACTORS,
      {
        name: 'employee_dyn',
        title: '员工',
        dataType: DataType.STRING,
        resource: { name: 'Employee', features: ['pagination', 'filter'] as const },
      },
    ];
    const workspace = new RuleWorkspaceBuilder()
      .withFactors(factors)
      .withFetchers([fetcher])
      .build();
    const group = workspace.addGroup()!;
    const rule = group.addRule()!;

    // Must create fields to activate reactions
    rule.form.createField({ name: 'name' });
    rule.form.createField({ name: 'operator' });
    rule.form.createField({ name: 'threshold' });

    rule.form.setValues({ name: 'employee_dyn' });
    // 不抛错即表示 fetcher 已成功注册
    const $threshold = rule.form.getFieldState('threshold');
    assert(Array.isArray($threshold.component));
    expect($threshold.component[1]).toMatchObject({ properties: { type: 'Select' } });
  });

  it('build twice returns different instances', () => {
    const builder = new RuleWorkspaceBuilder().withFactors(ALL_FACTORS);
    const ws1 = builder.build();
    builder.withFactors(ALL_FACTORS);
    const ws2 = builder.build();
    expect(ws1).not.toBe(ws2);
  });
});

describe('createRuleWorkspace', () => {
  it('equivalent to builder with only factors', () => {
    const ws = createRuleWorkspace({ factors: ALL_FACTORS });
    expect(ws.groups.value).toEqual([]);
  });

  it('supports fetchers and ruleGroups', () => {
    const fetcher = providePaginatedFilterableFetcher({
      fetch: vi.fn().mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0 }),
    });
    const ws = createRuleWorkspace({
      factors: ALL_FACTORS,
      fetchers: [fetcher],
      ruleGroups: [SAMPLE_GROUP],
    });
    expect(ws.snapshots).toHaveLength(1);
    expect(ws.groups.value).toHaveLength(1);
  });

  it('omits optional fields cleanly', () => {
    const ws = createRuleWorkspace({ factors: ALL_FACTORS });
    expect(ws.snapshots).toEqual([]);
  });
});
