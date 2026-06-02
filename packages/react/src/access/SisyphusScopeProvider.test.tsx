import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SisyphusScope } from './SisyphusScope';
import { SisyphusScopeProvider } from './SisyphusScopeProvider';
import { useSisyphusScope } from './useSisyphusScope';

describe('SisyphusScopeProvider', () => {
  it('should render children', () => {
    // Arrange
    const mockScope = { renderer: vi.fn() } as unknown as SisyphusScope;

    // Act
    const { getByTestId } = render(
      <SisyphusScopeProvider scope={mockScope}>
        <div data-testid="child">hello</div>
      </SisyphusScopeProvider>
    );

    // Assert
    expect(getByTestId('child').textContent).toBe('hello');
  });

  it('should provide scope to descendant components via useSisyphusScope', () => {
    // Arrange
    const mockScope = { renderer: vi.fn() } as unknown as SisyphusScope;

    function TestConsumer() {
      const scope = useSisyphusScope();
      return <div data-testid="consumer">{scope === mockScope ? 'yes' : 'no'}</div>;
    }

    // Act
    const { getByTestId } = render(
      <SisyphusScopeProvider scope={mockScope}>
        <TestConsumer />
      </SisyphusScopeProvider>
    );

    // Assert
    expect(getByTestId('consumer').textContent).toBe('yes');
  });
});
