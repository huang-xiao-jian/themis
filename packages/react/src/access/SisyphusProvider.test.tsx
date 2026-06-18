import type { RuleWorkspaceScheduler } from '@sisyphus/core';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SisyphusProvider } from './SisyphusProvider';
import { useSisyphusScheduler } from './useSisyphusScheduler';

describe('SisyphusProvider', () => {
  it('should render children', () => {
    const mockScheduler = {} as unknown as RuleWorkspaceScheduler;

    const { getByTestId } = render(
      <SisyphusProvider scheduler={mockScheduler}>
        <div data-testid="child">hello</div>
      </SisyphusProvider>
    );

    expect(getByTestId('child').textContent).toBe('hello');
  });

  it('should provide scheduler to descendant components via useSisyphusScheduler', () => {
    const mockScheduler = {} as unknown as RuleWorkspaceScheduler;

    function TestConsumer() {
      const scheduler = useSisyphusScheduler();
      return <div data-testid="consumer">{scheduler === mockScheduler ? 'yes' : 'no'}</div>;
    }

    const { getByTestId } = render(
      <SisyphusProvider scheduler={mockScheduler}>
        <TestConsumer />
      </SisyphusProvider>
    );

    expect(getByTestId('consumer').textContent).toBe('yes');
  });
});
