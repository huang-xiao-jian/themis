import { createRuleWorkspace, DataType } from '@sisyphus/core';
import { SisyphusProvider } from '@sisyphus/react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RuleWorkspaceEditor, SisyphusAntdProvider } from './index';

describe('@sisyphus/antd public API', () => {
  window.matchMedia =
    window.matchMedia ||
    ((query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList);

  it('should export RuleWorkspaceEditor', () => {
    expect(RuleWorkspaceEditor).toBeDefined();
  });

  it('should export SisyphusAntdProvider', () => {
    expect(SisyphusAntdProvider).toBeDefined();
  });

  it('should render RuleWorkspaceEditor within SisyphusProvider', () => {
    const scheduler = createRuleWorkspace({
      factors: [{ name: 'is_vip', title: 'Is VIP', dataType: DataType.BOOLEAN }],
      ruleGroups: [
        {
          id: 'group-1',
          rules: [{ id: 'rule-1', name: 'is_vip', operator: 'is', threshold: true }],
        },
      ],
    });

    expect(() => {
      render(
        <SisyphusProvider scheduler={scheduler}>
          <SisyphusAntdProvider>
            <RuleWorkspaceEditor />
          </SisyphusAntdProvider>
        </SisyphusProvider>
      );
    }).not.toThrow();
  });
});
