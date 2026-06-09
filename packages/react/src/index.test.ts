import { describe, expect, it } from 'vitest';
import {
  createSisyphusScope,
  RuleWorkspaceView,
  SisyphusScopeProvider,
  useSisyphusScope,
  WorkspaceEditor,
} from './index';

describe('@sisyphus/react public API', () => {
  it('should export the workspace view application component', () => {
    expect(RuleWorkspaceView).toBeDefined();
  });

  it('should export access layer API', () => {
    expect(createSisyphusScope).toBeDefined();
    expect(SisyphusScopeProvider).toBeDefined();
    expect(useSisyphusScope).toBeDefined();
    expect(WorkspaceEditor).toBeDefined();
  });
});
