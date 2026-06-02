import type { BaseProperties } from './BaseProperties';

/**
 * 布尔开关
 *
 * 适用场景：dataType=boolean
 */
export interface SwitchProperties extends BaseProperties {
  readonly type: 'Switch';
}
