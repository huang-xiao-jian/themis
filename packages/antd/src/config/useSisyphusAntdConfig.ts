import { useContext } from 'react';
import { DEFAULT_SISYPHUS_ANTD_CONFIG } from './SisyphusAntdConfig';
import { SisyphusAntdContext } from './SisyphusAntdContext';

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
}

/** 消费 antd 配置，提供默认值 fallback */
export function useSisyphusAntdConfig(): ResolvedSisyphusAntdConfig {
  const config = useContext(SisyphusAntdContext);
  const defaults = DEFAULT_SISYPHUS_ANTD_CONFIG;
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
  };
}
