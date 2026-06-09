import type { SwitchProperties } from '@sisyphus/core';
import { SwitchProps } from 'antd';
import type { ResolvedSisyphusAntdConfig } from '../config/useSisyphusAntdConfig';

/** antd Switch 组件属性 */
export type AntdSwitchProps = Pick<
  SwitchProps,
  'checked' | 'onChange' | 'checkedChildren' | 'unCheckedChildren' | 'size'
>;

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
      size: config.size === 'small' ? 'small' : 'medium',
    };
  }
}
