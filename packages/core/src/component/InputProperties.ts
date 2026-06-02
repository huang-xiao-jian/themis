import type { BaseProperties } from './BaseProperties';

/**
 * 单行输入（短文本/数字）
 *
 * 适用场景：string/number + manual + point + single + max 长度 ≤ 100
 */
export interface InputProperties extends BaseProperties {
  readonly type: 'Input';
}
