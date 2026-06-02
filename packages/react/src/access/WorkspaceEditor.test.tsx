import type { RuleWorkspaceScheduler } from '@sisyphus/core';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { RuleWorkspaceViewProperties } from '../application/protocol';
import { createSisyphusScope } from './createSisyphusScope';
import { SisyphusScopeProvider } from './SisyphusScopeProvider';
import { WorkspaceEditor } from './WorkspaceEditor';

describe('WorkspaceEditor', () => {
  const mockWorkspace = {} as unknown as RuleWorkspaceScheduler;

  it('should render RuleWorkspaceView with the provided workspace scheduler', () => {
    // Arrange
    const StubWorkspaceView = (props: RuleWorkspaceViewProperties) => (
      <div data-testid="workspace">{props.type}</div>
    );

    const scope = createSisyphusScope({
      plugins: [
        {
          name: 'test-plugin',
          install: (context) => {
            context.registry.registerRuleWorkspaceView(StubWorkspaceView);
          },
        },
      ],
    });

    // Act
    const { getByTestId } = render(
      <SisyphusScopeProvider scope={scope}>
        <WorkspaceEditor workspace={mockWorkspace} />
      </SisyphusScopeProvider>
    );

    // Assert
    expect(getByTestId('workspace')).toBeDefined();
    expect(getByTestId('workspace').textContent).toBe('RuleWorkspaceView');
  });

  it('should throw when used outside of SisyphusScopeProvider', () => {
    // Act & Assert
    expect(() => {
      render(<WorkspaceEditor workspace={mockWorkspace} />);
    }).toThrow('[sisyphus]');
  });
});
