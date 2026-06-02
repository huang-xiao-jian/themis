import type { SwitchProperties } from '@sisyphus/core';
import type { ResolvedSisyphusAntdConfig } from '../config/useSisyphusAntdConfig';

/** antd Switch 组件属性 */
export interface AntdSwitchProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly checkedChildren: string;
  readonly unCheckedChildren: string;
  readonly size?: 'small' | 'default';
}

/** Switch → antd Switch 属性映射器 */
export class SwitchPropsMapper {
  mapToProps(
    properties: SwitchProperties,
    config: ResolvedSisyphusAntdConfig,
    value: unknown,
    onChange: (value: unknown) => void
  ): AntdSwitchProps {
    return {
      checked: Boolean(value),
      onChange: (checked: boolean) => onChange(checked),
      checkedChildren: config.switchLabels.checked,
      unCheckedChildren: config.switchLabels.unChecked,
      size: config.size === 'small' ? 'small' : 'default',
    };
  }
}
