import type { BaseProperties } from './BaseProperties';

/**
 * 多行文本输入
 *
 * 适用场景：string + manual + point + single + max 长度 > 100
 */
export interface TextAreaProperties extends BaseProperties {
  readonly type: 'TextArea';
}
