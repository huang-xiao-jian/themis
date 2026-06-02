import type {
  AtomicRuleGroupScheduler,
  AtomicRuleScheduler,
  RuleWorkspaceScheduler,
} from '@sisyphus/core';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { DefaultComponentRenderer } from './DefaultComponentRenderer';
import { DefaultComponentRendererRegistry } from './DefaultComponentRendererRegistry';
import type {
  AtomicRuleGroupViewProperties,
  AtomicRuleViewProperties,
  RuleWorkspaceViewProperties,
} from './protocol';

describe('DefaultComponentRenderer', () => {
  const mockAtomicRuleScheduler = { id: 'rule-1' } as unknown as AtomicRuleScheduler;
  const mockAtomicRuleGroupScheduler = { id: 'group-1' } as unknown as AtomicRuleGroupScheduler;
  const mockRuleWorkspaceScheduler = {} as unknown as RuleWorkspaceScheduler;

  it('should render registered AtomicRuleView component', () => {
    // Arrange
    const registry = new DefaultComponentRendererRegistry();
    const StubComponent = (props: AtomicRuleViewProperties) =>
      createElement('div', null, props.scheduler.id);
    registry.registerAtomicRuleView(StubComponent);
    const renderer = new DefaultComponentRenderer(registry);

    const props: AtomicRuleViewProperties = {
      type: 'AtomicRuleView',
      scheduler: mockAtomicRuleScheduler,
    };

    // Act
    const element = renderer.render(props);

    // Assert
    expect(element.type).toBe(StubComponent);
    expect(element.props).toEqual(props);
  });

  it('should render registered AtomicRuleGroupView component', () => {
    // Arrange
    const registry = new DefaultComponentRendererRegistry();
    const StubComponent = (props: AtomicRuleGroupViewProperties) =>
      createElement('div', null, props.scheduler.id);
    registry.registerAtomicRuleGroupView(StubComponent);
    const renderer = new DefaultComponentRenderer(registry);

    const props: AtomicRuleGroupViewProperties = {
      type: 'AtomicRuleGroupView',
      scheduler: mockAtomicRuleGroupScheduler,
    };

    // Act
    const element = renderer.render(props);

    // Assert
    expect(element.type).toBe(StubComponent);
    expect(element.props).toEqual(props);
  });

  it('should render registered RuleWorkspaceView component', () => {
    // Arrange
    const registry = new DefaultComponentRendererRegistry();
    const StubComponent = (_props: RuleWorkspaceViewProperties) => createElement('div');
    registry.registerRuleWorkspaceView(StubComponent);
    const renderer = new DefaultComponentRenderer(registry);

    const props: RuleWorkspaceViewProperties = {
      type: 'RuleWorkspaceView',
      scheduler: mockRuleWorkspaceScheduler,
    };

    // Act
    const element = renderer.render(props);

    // Assert
    expect(element.type).toBe(StubComponent);
    expect(element.props).toEqual(props);
  });

  it('should throw when AtomicRuleView component is not registered', () => {
    // Arrange
    const registry = new DefaultComponentRendererRegistry();
    const renderer = new DefaultComponentRenderer(registry);

    const props: AtomicRuleViewProperties = {
      type: 'AtomicRuleView',
      scheduler: mockAtomicRuleScheduler,
    };

    // Act & Assert
    expect(() => renderer.render(props)).toThrow('[sisyphus]');
  });

  it('should throw when AtomicRuleGroupView component is not registered', () => {
    // Arrange
    const registry = new DefaultComponentRendererRegistry();
    const renderer = new DefaultComponentRenderer(registry);

    const props: AtomicRuleGroupViewProperties = {
      type: 'AtomicRuleGroupView',
      scheduler: mockAtomicRuleGroupScheduler,
    };

    // Act & Assert
    expect(() => renderer.render(props)).toThrow('[sisyphus]');
  });

  it('should throw when RuleWorkspaceView component is not registered', () => {
    // Arrange
    const registry = new DefaultComponentRendererRegistry();
    const renderer = new DefaultComponentRenderer(registry);

    const props: RuleWorkspaceViewProperties = {
      type: 'RuleWorkspaceView',
      scheduler: mockRuleWorkspaceScheduler,
    };

    // Act & Assert
    expect(() => renderer.render(props)).toThrow('[sisyphus]');
  });
});
