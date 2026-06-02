import type { AtomicRuleScheduler } from '@sisyphus/core';
import { render } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it } from 'vitest';
import type { SisyphusScope } from '../access/SisyphusScope';
import { SisyphusScopeContext } from '../access/useSisyphusScope';
import { AtomicRuleView } from './AtomicRuleView';
import type { AtomicRuleViewProperties } from './protocol';

describe('AtomicRuleView', () => {
  const mockScheduler = { id: 'rule-1' } as unknown as AtomicRuleScheduler;

  it('should delegate rendering to registered component via renderer', () => {
    // Arrange
    const StubComponent = (props: AtomicRuleViewProperties) => (
      <div data-testid="stub">{props.scheduler.id}</div>
    );

    const mockScope = {
      renderer: () => ({
        render: (props: AtomicRuleViewProperties) => <StubComponent {...props} />,
      }),
    } as unknown as SisyphusScope;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SisyphusScopeContext.Provider value={mockScope}>{children}</SisyphusScopeContext.Provider>
    );

    // Act
    const { getByTestId } = render(
      <AtomicRuleView type="AtomicRuleView" scheduler={mockScheduler} />,
      { wrapper }
    );

    // Assert
    expect(getByTestId('stub')).toBeDefined();
    expect(getByTestId('stub').textContent).toBe('rule-1');
  });

  it('should pass scheduler prop to registered component', () => {
    // Arrange
    const receivedProps: AtomicRuleViewProperties[] = [];
    const StubComponent = (props: AtomicRuleViewProperties) => {
      receivedProps.push(props);
      return <div>rendered</div>;
    };

    const mockScope = {
      renderer: () => ({
        render: (props: AtomicRuleViewProperties) => <StubComponent {...props} />,
      }),
    } as unknown as SisyphusScope;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SisyphusScopeContext.Provider value={mockScope}>{children}</SisyphusScopeContext.Provider>
    );

    // Act
    render(<AtomicRuleView type="AtomicRuleView" scheduler={mockScheduler} />, { wrapper });

    // Assert
    expect(receivedProps[0].type).toBe('AtomicRuleView');
    expect(receivedProps[0].scheduler).toBe(mockScheduler);
  });
});
