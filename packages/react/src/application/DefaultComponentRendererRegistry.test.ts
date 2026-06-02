import { describe, expect, it } from 'vitest';
import { DefaultComponentRendererRegistry } from './DefaultComponentRendererRegistry';
import type {
  AtomicRuleGroupViewProperties,
  AtomicRuleViewProperties,
  RuleWorkspaceViewProperties,
} from './protocol';

describe('DefaultComponentRendererRegistry', () => {
  it('should register and retrieve AtomicRuleView component', () => {
    // Arrange
    const registry = new DefaultComponentRendererRegistry();
    const StubComponent = (_props: AtomicRuleViewProperties) => null;

    // Act
    registry.registerAtomicRuleView(StubComponent);

    // Assert
    expect(registry.getAtomicRuleView()).toBe(StubComponent);
  });

  it('should register and retrieve AtomicRuleGroupView component', () => {
    // Arrange
    const registry = new DefaultComponentRendererRegistry();
    const StubComponent = (_props: AtomicRuleGroupViewProperties) => null;

    // Act
    registry.registerAtomicRuleGroupView(StubComponent);

    // Assert
    expect(registry.getAtomicRuleGroupView()).toBe(StubComponent);
  });

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
    const FirstComponent = (_props: AtomicRuleViewProperties) => null;
    const SecondComponent = (_props: AtomicRuleViewProperties) => null;

    // Act
    registry.registerAtomicRuleView(FirstComponent);
    registry.registerAtomicRuleView(SecondComponent);

    // Assert
    expect(registry.getAtomicRuleView()).toBe(SecondComponent);
  });

  it('should return null when no component is registered', () => {
    // Arrange
    const registry = new DefaultComponentRendererRegistry();

    // Assert
    expect(registry.getAtomicRuleView()).toBeNull();
    expect(registry.getAtomicRuleGroupView()).toBeNull();
    expect(registry.getRuleWorkspaceView()).toBeNull();
  });
});
