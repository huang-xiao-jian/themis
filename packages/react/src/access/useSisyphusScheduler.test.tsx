import type { RuleWorkspaceScheduler } from '@sisyphus/core';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { SisyphusSchedulerContext, useSisyphusScheduler } from './useSisyphusScheduler';

describe('useSisyphusScheduler', () => {
  it('should return scheduler when used within SisyphusSchedulerContext', () => {
    const mockScheduler = {} as unknown as RuleWorkspaceScheduler;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <SisyphusSchedulerContext.Provider value={mockScheduler}>
        {children}
      </SisyphusSchedulerContext.Provider>
    );

    const { result } = renderHook(() => useSisyphusScheduler(), { wrapper });

    expect(result.current).toBe(mockScheduler);
  });

  it('should throw when used outside of SisyphusProvider', () => {
    expect(() => {
      renderHook(() => useSisyphusScheduler());
    }).toThrow('[sisyphus] useSisyphusScheduler must be used within a SisyphusProvider.');
  });
});
