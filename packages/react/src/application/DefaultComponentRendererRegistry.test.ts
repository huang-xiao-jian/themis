import { describe, expect, it } from 'vitest';
import { DefaultComponentRendererRegistry } from './DefaultComponentRendererRegistry';
import type { RuleWorkspaceViewProperties } from './protocol';

describe('DefaultComponentRendererRegistry', () => {
  it('should register and retrieve RuleWorkspaceView component', () => {
    // Arrange
    const registry = new DefaultComponentRendererRegistry();
    const StubComponent = (_props: RuleWorkspaceViewProperties) => null;

    // Act
    registry.registerRuleWorkspaceView(StubComponent);

    // Assert
    expect(registry.getRuleWorkspaceView()).toBe(StubComponent);
  });

  it('should overwrite previously registered component', () => {
    // Arrange
    const registry = new DefaultComponentRendererRegistry();
    const FirstComponent = (_props: RuleWorkspaceViewProperties) => null;
    const SecondComponent = (_props: RuleWorkspaceViewProperties) => null;

    // Act
    registry.registerRuleWorkspaceView(FirstComponent);
    registry.registerRuleWorkspaceView(SecondComponent);

    // Assert
    expect(registry.getRuleWorkspaceView()).toBe(SecondComponent);
  });

  it('should return null when no component is registered', () => {
    // Arrange
    const registry = new DefaultComponentRendererRegistry();

    // Assert
    expect(registry.getRuleWorkspaceView()).toBeNull();
  });
});
