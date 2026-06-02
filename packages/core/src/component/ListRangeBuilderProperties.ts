import { DataType } from '../dsl/DataType';
import type { FieldConstraints } from '../dsl/FieldConstraints';
import { Semantic } from '../dsl/Semantic';

/**
 * 区间列表项级别属性
 */
export interface ListRangeBuilderItemProperties {
  /** 列表项组件类型 */
  readonly type: 'RangeInput' | 'RangePicker';
  /** 列表项数据类型 */
  readonly dataType: DataType;
  /** 列表项语义化场景 */
  readonly semantic?: Semantic;
  /** 列表项数据约束 */
  readonly constraints?: FieldConstraints;
}

/**
 * 区间列表级别属性
 */
export interface ListRangeBuilderBaseProperties {
  readonly name: string;
  readonly title: string;
  readonly constraints?: {
    readonly minItems?: number;
    readonly maxItems?: number;
  };
}

/**
 * 区间列表构建器
 *
 * 适用场景：manual + range + quantity=multiple
 */
export interface ListRangeBuilderProperties extends ListRangeBuilderBaseProperties {
  readonly type: 'ListRangeBuilder';
  readonly item: ListRangeBuilderItemProperties;
}
