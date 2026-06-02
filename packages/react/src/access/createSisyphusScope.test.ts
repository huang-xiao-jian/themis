import { describe, expect, it, vi } from 'vitest';
import type { SisyphusContext } from '../application/protocol';
import { createSisyphusScope } from './createSisyphusScope';

describe('createSisyphusScope', () => {
  it('should return a SisyphusScope with renderer method', () => {
    // Act
    const scope = createSisyphusScope({ plugins: [] });

    // Assert
    expect(scope).toBeDefined();
    expect(typeof scope.renderer).toBe('function');
    expect(scope.renderer()).toBeDefined();
  });

  it('should call install on each plugin with SisyphusContext', () => {
    // Arrange
    const installMock = vi.fn();
    const plugin = { name: 'test-plugin', install: installMock };

    // Act
    createSisyphusScope({ plugins: [plugin] });

    // Assert
    expect(installMock).toHaveBeenCalledTimes(1);
    const context: SisyphusContext = installMock.mock.calls[0][0];
    expect(context.registry).toBeDefined();
    expect(typeof context.registry.registerAtomicRuleView).toBe('function');
    expect(typeof context.registry.registerAtomicRuleGroupView).toBe('function');
    expect(typeof context.registry.registerRuleWorkspaceView).toBe('function');
  });

  it('should call plugins in order', () => {
    // Arrange
    const callOrder: string[] = [];
    const pluginA = {
      name: 'plugin-a',
      install: () => {
        callOrder.push('a');
      },
    };
    const pluginB = {
      name: 'plugin-b',
      install: () => {
        callOrder.push('b');
      },
    };

    // Act
    createSisyphusScope({ plugins: [pluginA, pluginB] });

    // Assert
    expect(callOrder).toEqual(['a', 'b']);
  });

  it('should return the same renderer instance on multiple calls', () => {
    // Arrange
    const scope = createSisyphusScope({ plugins: [] });

    // Act
    const renderer1 = scope.renderer();
    const renderer2 = scope.renderer();

    // Assert
    expect(renderer1).toBe(renderer2);
  });
});
