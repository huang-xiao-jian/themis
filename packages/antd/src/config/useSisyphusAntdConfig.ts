import { useContext } from 'react';
import { DEFAULT_ATOMIC_RULE_LAYOUT, DEFAULT_SISYPHUS_ANTD_CONFIG } from './SisyphusAntdConfig';
import { SisyphusAntdContext } from './SisyphusAntdContext';

/** 解析后的 AtomicRule 行布局（所有字段必填） */
export interface ResolvedAtomicRuleLayout {
  readonly name: string;
  readonly operator: string;
  readonly threshold: string;
  readonly action: string;
  readonly gutter: number;
}

/** 解析后的配置（所有字段必填） */
export interface ResolvedSisyphusAntdConfig {
  readonly size: 'small' | 'middle' | 'large';
  readonly placeholderTemplate: {
    readonly input: string;
    readonly select: string;
  };
  readonly switchLabels: {
    readonly checked: string;
    readonly unChecked: string;
  };
  readonly atomicRuleLayout: ResolvedAtomicRuleLayout;
}

/** 消费 antd 配置，提供默认值 fallback */
export function useSisyphusAntdConfig(): ResolvedSisyphusAntdConfig {
  const config = useContext(SisyphusAntdContext);
  const defaults = DEFAULT_SISYPHUS_ANTD_CONFIG;
  const layoutDefaults = DEFAULT_ATOMIC_RULE_LAYOUT;
  const layout = config.atomicRuleLayout;
  return {
    size: config.size ?? defaults.size,
    placeholderTemplate: {
      input: config.placeholderTemplate?.input ?? defaults.placeholderTemplate.input,
      select: config.placeholderTemplate?.select ?? defaults.placeholderTemplate.select,
    },
    switchLabels: {
      checked: config.switchLabels?.checked ?? defaults.switchLabels.checked,
      unChecked: config.switchLabels?.unChecked ?? defaults.switchLabels.unChecked,
    },
    atomicRuleLayout: {
      name: layout?.name ?? layoutDefaults.name,
      operator: layout?.operator ?? layoutDefaults.operator,
      threshold: layout?.threshold ?? layoutDefaults.threshold,
      action: layout?.action ?? layoutDefaults.action,
      gutter: layout?.gutter ?? layoutDefaults.gutter,
    },
  };
}
