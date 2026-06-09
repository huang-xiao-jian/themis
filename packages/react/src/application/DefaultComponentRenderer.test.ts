import type { RuleWorkspaceScheduler } from '@sisyphus/core';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { DefaultComponentRenderer } from './DefaultComponentRenderer';
import { DefaultComponentRendererRegistry } from './DefaultComponentRendererRegistry';
import type { RuleWorkspaceViewProperties } from './protocol';

describe('DefaultComponentRenderer', () => {
  const mockRuleWorkspaceScheduler = {} as unknown as RuleWorkspaceScheduler;

  it('should render registered RuleWorkspaceView component', () => {
    // Arrange
    const registry = new DefaultComponentRendererRegistry();
    const StubComponent = (_props: RuleWorkspaceViewProperties) => createElement('div');
    registry.registerRuleWorkspaceView(StubComponent);
    const renderer = new DefaultComponentRenderer(registry);

    const props: RuleWorkspaceViewProperties = {
      scheduler: mockRuleWorkspaceScheduler,
    };

    // Act
    const element = renderer.renderRuleWorkspaceView(props);

    // Assert
    expect(element.type).toBe(StubComponent);
    expect(element.props).toEqual(props);
  });

  it('should throw when RuleWorkspaceView component is not registered', () => {
    // Arrange
    const registry = new DefaultComponentRendererRegistry();
    const renderer = new DefaultComponentRenderer(registry);

    const props: RuleWorkspaceViewProperties = {
      scheduler: mockRuleWorkspaceScheduler,
    };

    // Act & Assert
    expect(() => renderer.renderRuleWorkspaceView(props)).toThrow('[sisyphus]');
  });
});
