import type { AtomicRuleGroupScheduler } from '@sisyphus/core';
import { render } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it } from 'vitest';
import type { SisyphusScope } from '../access/SisyphusScope';
import { SisyphusScopeContext } from '../access/useSisyphusScope';
import { AtomicRuleGroupView } from './AtomicRuleGroupView';
import type { AtomicRuleGroupViewProperties } from './protocol';

describe('AtomicRuleGroupView', () => {
  const mockScheduler = { id: 'group-1' } as unknown as AtomicRuleGroupScheduler;

  it('should delegate rendering to registered component via renderer', () => {
    // Arrange
    const StubComponent = (props: AtomicRuleGroupViewProperties) => (
      <div data-testid="stub">{props.scheduler.id}</div>
    );

    const mockScope = {
      renderer: () => ({
        render: (props: AtomicRuleGroupViewProperties) => <StubComponent {...props} />,
      }),
    } as unknown as SisyphusScope;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SisyphusScopeContext.Provider value={mockScope}>{children}</SisyphusScopeContext.Provider>
    );

    // Act
    const { getByTestId } = render(
      <AtomicRuleGroupView type="AtomicRuleGroupView" scheduler={mockScheduler} />,
      { wrapper }
    );

    // Assert
    expect(getByTestId('stub')).toBeDefined();
    expect(getByTestId('stub').textContent).toBe('group-1');
  });

  it('should pass scheduler prop to registered component', () => {
    // Arrange
    const receivedProps: AtomicRuleGroupViewProperties[] = [];
    const StubComponent = (props: AtomicRuleGroupViewProperties) => {
      receivedProps.push(props);
      return <div>rendered</div>;
    };

    const mockScope = {
      renderer: () => ({
        render: (props: AtomicRuleGroupViewProperties) => <StubComponent {...props} />,
      }),
    } as unknown as SisyphusScope;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SisyphusScopeContext.Provider value={mockScope}>{children}</SisyphusScopeContext.Provider>
    );

    // Act
    render(<AtomicRuleGroupView type="AtomicRuleGroupView" scheduler={mockScheduler} />, {
      wrapper,
    });

    // Assert
    expect(receivedProps[0].type).toBe('AtomicRuleGroupView');
    expect(receivedProps[0].scheduler).toBe(mockScheduler);
  });
});
