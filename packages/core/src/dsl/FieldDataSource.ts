/**
 * 数据源基础结构，用于受限选项（资源、字典、枚举等）
 */
export interface FieldDataSource {
  /** 选项显示文本 */
  readonly label: string;
  /** 选项值，可为字符串或数字 */
  readonly value: string | number;
  /** 是否禁用（可选） */
  readonly disabled?: boolean;
}
