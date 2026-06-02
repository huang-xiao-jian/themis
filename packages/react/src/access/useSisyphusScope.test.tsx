import { renderHook } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { SisyphusScope } from './SisyphusScope';
import { SisyphusScopeContext, useSisyphusScope } from './useSisyphusScope';

describe('useSisyphusScope', () => {
  it('should return scope when used within SisyphusScopeContext', () => {
    // Arrange
    const mockScope = { renderer: vi.fn() } as unknown as SisyphusScope;
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SisyphusScopeContext.Provider value={mockScope}>{children}</SisyphusScopeContext.Provider>
    );

    // Act
    const { result } = renderHook(() => useSisyphusScope(), { wrapper });

    // Assert
    expect(result.current).toBe(mockScope);
  });

  it('should throw when used outside of SisyphusScopeContext', () => {
    // Act & Assert
    expect(() => {
      renderHook(() => useSisyphusScope());
    }).toThrow('[sisyphus] useSisyphusScope must be used within a SisyphusScopeProvider.');
  });
});
