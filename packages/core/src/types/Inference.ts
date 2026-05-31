import type { DataType, FieldConstraints, Semantic } from './DSL';
import type { IStaticResource, IElementaryDynamicResource } from './Resource';

/**
 * 抽象表单组件基础属性
 */
export interface BaseProperties {
  /** 字段标识 */
  name: string;
  /** 字段标题 */
  title: string;
  /** 数据类型 */
  dataType: DataType;
  /** 语义化场景 */
  semantic?: Semantic;
  /** 数据约束 */
  constraints?: FieldConstraints;
}

/**
 * InputProperties - 单行输入
 */
export interface InputProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'Input';
}

/**
 * TextAreaProperties - 多行文本输入
 */
export interface TextAreaProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'TextArea';
}

/**
 * RangeInputProperties - 区间输入
 */
export interface RangeInputProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'RangeInput';
}

/**
 * SwitchProperties - 开关
 */
export interface SwitchProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'Switch';
}

/**
 * SelectProperties - 单选
 */
export interface SelectProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'Select';
  /** 数据资源 */
  readonly resource: IStaticResource<any> | IElementaryDynamicResource<any>;
}

/**
 * MultipleSelectProperties - 多选
 */
export interface MultipleSelectProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'MultipleSelect';
  /** 数据资源 */
  readonly resource: IStaticResource<any> | IElementaryDynamicResource<any>;
}

/**
 * PickerProperties - 选择器
 */
export interface PickerProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'Picker';
}

/**
 * RangePickerProperties - 区间选择器
 */
export interface RangePickerProperties extends BaseProperties {
  /** 组件类型标识 */
  readonly type: 'RangePicker';
}

/**
 * 列表项级别属性
 */
export interface ListBuilderItemProperties {
  /** 列表项组件类型 */
  readonly type: 'Input' | 'Picker';
  /** 列表项数据类型 */
  readonly dataType: 'string' | 'number' | 'boolean';
  /** 列表项语义化场景（可选） */
  readonly semantic?: Semantic;
  /** 列表项数据约束（可选） */
  readonly constraints?: FieldConstraints;
}

/**
 * 列表级别属性
 */
export interface ListBuilderBaseProperties {
  /** 字段标识 */
  readonly name: string;
  /** 字段标题 */
  readonly title: string;
  /** 列表项数量约束 */
  readonly constraints?: {
    /** 最少数量 */
    minItems?: number;
    /** 最多数量 */
    maxItems?: number;
  };
}

/**
 * ListBuilderProperties - 列表构建器
 */
export interface ListBuilderProperties extends ListBuilderBaseProperties {
  /** 组件类型标识 */
  readonly type: 'ListBuilder';
  /** 列表项属性对象 */
  readonly item: ListBuilderItemProperties;
}

/**
 * 列表项级别属性 - 区间
 */
export interface ListRangeBuilderItemProperties {
  /** 列表项组件类型 */
  readonly type: 'RangeInput' | 'RangePicker';
  /** 列表项数据类型 */
  readonly dataType: 'string' | 'number' | 'boolean';
  /** 列表项语义化场景（可选） */
  readonly semantic?: Semantic;
  /** 列表项数据约束（可选） */
  readonly constraints?: FieldConstraints;
}

/**
 * ListRangeBuilderProperties - 区间列表构建器
 */
export interface ListRangeBuilderProperties extends ListBuilderBaseProperties {
  /** 组件类型标识 */
  readonly type: 'ListRangeBuilder';
  /** 列表项属性对象 */
  readonly item: ListRangeBuilderItemProperties;
}

/**
 * 表单组件属性类型别名
 */
export type ThresholdComponentProperties =
  | InputProperties
  | TextAreaProperties
  | RangeInputProperties
  | SwitchProperties
  | SelectProperties
  | MultipleSelectProperties
  | PickerProperties
  | RangePickerProperties
  | ListBuilderProperties
  | ListRangeBuilderProperties;