import type { RuleWorkspaceScheduler } from '@sisyphus/core';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import type { SisyphusScope } from '../access/SisyphusScope';
import { SisyphusScopeContext } from '../access/useSisyphusScope';
import type { RuleWorkspaceViewProperties } from './protocol';
import { RuleWorkspaceView } from './RuleWorkspaceView';

describe('RuleWorkspaceView', () => {
  const mockScheduler = {} as unknown as RuleWorkspaceScheduler;

  it('should delegate rendering to registered component via renderer', () => {
    // Arrange
    const StubComponent = (_props: RuleWorkspaceViewProperties) => (
      <div data-testid="stub">workspace</div>
    );

    const mockScope = {
      renderer: () => ({
        render: (props: RuleWorkspaceViewProperties) => <StubComponent {...props} />,
      }),
    } as unknown as SisyphusScope;

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SisyphusScopeContext.Provider value={mockScope}>{children}</SisyphusScopeContext.Provider>
    );

    // Act
    const { getByTestId } = render(
      <RuleWorkspaceView type="RuleWorkspaceView" scheduler={mockScheduler} />,
      { wrapper }
    );

    // Assert
    expect(getByTestId('stub')).toBeDefined();
    expect(getByTestId('stub').textContent).toBe('workspace');
  });

  it('should pass scheduler prop to registered component', () => {
    // Arrange
    const receivedProps: RuleWorkspaceViewProperties[] = [];
    const StubComponent = (props: RuleWorkspaceViewProperties) => {
      receivedProps.push(props);
      return <div>rendered</div>;
    };

    const mockScope = {
      renderer: () => ({
        render: (props: RuleWorkspaceViewProperties) => <StubComponent {...props} />,
      }),
    } as unknown as SisyphusScope;

    const wrapper = ({ children }: { children: ReactNode }) => (
      <SisyphusScopeContext.Provider value={mockScope}>{children}</SisyphusScopeContext.Provider>
    );

    // Act
    render(<RuleWorkspaceView type="RuleWorkspaceView" scheduler={mockScheduler} />, { wrapper });

    // Assert
    expect(receivedProps[0].type).toBe('RuleWorkspaceView');
    expect(receivedProps[0].scheduler).toBe(mockScheduler);
  });
});
