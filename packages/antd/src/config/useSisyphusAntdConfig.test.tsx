import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_ATOMIC_RULE_LAYOUT, type SisyphusAntdConfig } from './SisyphusAntdConfig';
import { SisyphusAntdContext } from './SisyphusAntdContext';
import { useSisyphusAntdConfig } from './useSisyphusAntdConfig';

/** Create a wrapper that provides SisyphusAntdContext with given config */
function createWrapper(config: SisyphusAntdConfig) {
  return ({ children }: { children: ReactNode }) => (
    <SisyphusAntdContext.Provider value={config}>{children}</SisyphusAntdContext.Provider>
  );
}

describe('useSisyphusAntdConfig', () => {
  describe('atomicRuleLayout', () => {
    it('should return default layout values when no config is provided', () => {
      // Arrange
      const wrapper = createWrapper({});

      // Act
      const { result } = renderHook(() => useSisyphusAntdConfig(), { wrapper });

      // Assert
      expect(result.current.atomicRuleLayout).toEqual({
        name: DEFAULT_ATOMIC_RULE_LAYOUT.name,
        operator: DEFAULT_ATOMIC_RULE_LAYOUT.operator,
        threshold: DEFAULT_ATOMIC_RULE_LAYOUT.threshold,
        action: DEFAULT_ATOMIC_RULE_LAYOUT.action,
        gutter: DEFAULT_ATOMIC_RULE_LAYOUT.gutter,
      });
    });

    it('should override all layout values when fully specified', () => {
      // Arrange
      const customLayout = {
        name: '200px',
        operator: '160px',
        threshold: '1fr',
        action: '40px',
        gutter: 16,
      };
      const wrapper = createWrapper({ atomicRuleLayout: customLayout });

      // Act
      const { result } = renderHook(() => useSisyphusAntdConfig(), { wrapper });

      // Assert
      expect(result.current.atomicRuleLayout).toEqual(customLayout);
    });

    it('should merge partial layout values with defaults', () => {
      // Arrange
      const wrapper = createWrapper({
        atomicRuleLayout: { name: '250px', gutter: 12 },
      });

      // Act
      const { result } = renderHook(() => useSisyphusAntdConfig(), { wrapper });

      // Assert
      expect(result.current.atomicRuleLayout).toEqual({
        name: '250px',
        operator: DEFAULT_ATOMIC_RULE_LAYOUT.operator,
        threshold: DEFAULT_ATOMIC_RULE_LAYOUT.threshold,
        action: DEFAULT_ATOMIC_RULE_LAYOUT.action,
        gutter: 12,
      });
    });
  });
});
