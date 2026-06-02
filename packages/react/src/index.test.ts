import { describe, expect, it } from 'vitest';
import {
  AtomicRuleGroupView,
  AtomicRuleView,
  createSisyphusScope,
  RuleWorkspaceView,
  SisyphusScopeProvider,
  useSisyphusScope,
  WorkspaceEditor,
} from './index';

describe('@sisyphus/react public API', () => {
  it('should export application layer editor components', () => {
    expect(AtomicRuleView).toBeDefined();
    expect(AtomicRuleGroupView).toBeDefined();
    expect(RuleWorkspaceView).toBeDefined();
  });

  it('should export access layer API', () => {
    expect(createSisyphusScope).toBeDefined();
    expect(SisyphusScopeProvider).toBeDefined();
    expect(useSisyphusScope).toBeDefined();
    expect(WorkspaceEditor).toBeDefined();
  });
});
