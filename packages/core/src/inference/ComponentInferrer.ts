import type { RuleFactorDefinition } from '../types/DSL';
import type {
  ThresholdComponentProperties,
  InputProperties,
  TextAreaProperties,
  RangeInputProperties,
  SwitchProperties,
  SelectProperties,
  MultipleSelectProperties,
  PickerProperties,
  RangePickerProperties,
  ListBuilderProperties,
  ListBuilderItemProperties,
  ListRangeBuilderProperties,
  ListRangeBuilderItemProperties,
} from '../types/Inference';
import type { IStaticResource, IElementaryDynamicResource, Resource } from '../types/Resource';

/**
 * 推断表单组件类型
 *
 * @param factor 规则因子定义
 * @param resource 关联的资源（可选）
 * @returns 表单组件属性
 */
export function inferComponent(
  factor: RuleFactorDefinition,
  resource?: Resource
): ThresholdComponentProperties {
  const { name, title, dataType, semantic, mode = 'point', quantity = 'single', constraints } = factor;

  const baseProps = {
    name,
    title,
    dataType,
    semantic,
    constraints,
  };

  // 1. 有 resource → Select / MultipleSelect
  if (resource) {
    if (quantity === 'multiple') {
      const props: MultipleSelectProperties = {
        ...baseProps,
        type: 'MultipleSelect',
        resource: resource as IStaticResource | IElementaryDynamicResource,
      };
      return props;
    } else {
      const props: SelectProperties = {
        ...baseProps,
        type: 'Select',
        resource: resource as IStaticResource | IElementaryDynamicResource,
      };
      return props;
    }
  }

  // 2. dataType=boolean → Switch
  if (dataType === 'boolean') {
    const props: SwitchProperties = {
      ...baseProps,
      type: 'Switch',
    };
    return props;
  }

  // 3. 无 resource → 根据 mode/quantity 确定组件类型
  if (mode === 'point') {
    if (quantity === 'multiple') {
      // 多值单点 → ListBuilder
      const itemProps: ListBuilderItemProperties = {
        type: semantic ? 'Picker' : 'Input',
        dataType,
        semantic,
        constraints,
      };
      const props: ListBuilderProperties = {
        name,
        title,
        type: 'ListBuilder',
        item: itemProps,
        constraints: constraints?.minItems !== undefined || constraints?.maxItems !== undefined
          ? { minItems: constraints.minItems, maxItems: constraints.maxItems }
          : undefined,
      };
      return props;
    } else {
      // 单值单点 → 根据 semantic 确定
      if (semantic) {
        const props: PickerProperties = {
          ...baseProps,
          type: 'Picker',
        };
        return props;
      } else {
        const props: InputProperties = {
          ...baseProps,
          type: 'Input',
        };
        return props;
      }
    }
  } else {
    // mode = 'range'
    if (quantity === 'multiple') {
      // 多值区间 → ListRangeBuilder
      const itemProps: ListRangeBuilderItemProperties = {
        type: semantic ? 'RangePicker' : 'RangeInput',
        dataType,
        semantic,
        constraints,
      };
      const props: ListRangeBuilderProperties = {
        name,
        title,
        type: 'ListRangeBuilder',
        item: itemProps,
        constraints: constraints?.minItems !== undefined || constraints?.maxItems !== undefined
          ? { minItems: constraints.minItems, maxItems: constraints.maxItems }
          : undefined,
      };
      return props;
    } else {
      // 单值区间 → RangePicker / RangeInput
      if (semantic) {
        const props: RangePickerProperties = {
          ...baseProps,
          type: 'RangePicker',
        };
        return props;
      } else {
        const props: RangeInputProperties = {
          ...baseProps,
          type: 'RangeInput',
        };
        return props;
      }
    }
  }
}