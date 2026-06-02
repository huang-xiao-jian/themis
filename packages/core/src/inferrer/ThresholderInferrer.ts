import type { BaseProperties } from '../component/BaseProperties';
import type { InputProperties } from '../component/InputProperties';
import type { ListBuilderProperties } from '../component/ListBuilderProperties';
import type { ListRangeBuilderProperties } from '../component/ListRangeBuilderProperties';
import type { MultipleSelectProperties } from '../component/MultipleSelectProperties';
import type { PickerProperties } from '../component/PickerProperties';
import type { RangeInputProperties } from '../component/RangeInputProperties';
import type { RangePickerProperties } from '../component/RangePickerProperties';
import type { SelectProperties } from '../component/SelectProperties';
import type { SwitchProperties } from '../component/SwitchProperties';
import type { TextAreaProperties } from '../component/TextAreaProperties';
import type { ThresholdComponentProperties } from '../component/ThresholdComponentProperties';
import { DataType } from '../dsl/DataType';
import type { FieldConstraints } from '../dsl/FieldConstraints';
import { Mode } from '../dsl/Mode';
import { Quantity } from '../dsl/Quantity';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import type { Resource, ResourceFactory } from '../factory/ResourceFactory';

/**
 * 提取单值组件适用的约束（不含 minItems/maxItems）
 */
function extractBaseConstraints(factor: RuleFactorDefinition): FieldConstraints | undefined {
  if (!factor.constraints) return undefined;
  const { minItems: _mi, maxItems: _ma, ...rest } = factor.constraints;
  void _mi;
  void _ma;
  if (Object.keys(rest).length === 0) return undefined;
  return rest;
}

/**
 * 提取列表级别约束（只取 minItems/maxItems）
 */
function extractListBaseConstraints(
  factor: RuleFactorDefinition
): { minItems?: number; maxItems?: number } | undefined {
  if (!factor.constraints) return undefined;
  const out: { minItems?: number; maxItems?: number } = {};
  if (typeof factor.constraints.minItems === 'number') out.minItems = factor.constraints.minItems;
  if (typeof factor.constraints.maxItems === 'number') out.maxItems = factor.constraints.maxItems;
  if (Object.keys(out).length === 0) return undefined;
  return out;
}

/**
 * 构建 BaseProperties
 */
function buildBase(factor: RuleFactorDefinition): BaseProperties {
  const base: BaseProperties = {
    name: factor.name,
    title: factor.title,
    dataType: factor.dataType,
  };
  if (factor.semantic) {
    return { ...base, semantic: factor.semantic };
  }
  const constraints = extractBaseConstraints(factor);
  if (constraints) {
    return { ...base, constraints };
  }
  return base;
}

/**
 * Thresholder 推断器
 *
 * 根据 RuleFactorDefinition 推断中间形态的表单组件
 * 决策图见 [interpreter.md 第 207-250 行](../specs/interpreter.md)
 */
export class ThresholderInferrer {
  constructor(private readonly resourceFactory: ResourceFactory) {}

  infer(factor: RuleFactorDefinition): ThresholdComponentProperties {
    // 1. 资源声明分支
    if (factor.resource) {
      const resource = this.resourceFactory.create(factor);
      if (resource) {
        if (factor.quantity === Quantity.MULTIPLE) {
          return this.buildMultipleSelect(factor, resource);
        }
        return this.buildSelect(factor, resource);
      }
    }

    // 2. boolean → Switch
    if (factor.dataType === DataType.BOOLEAN) {
      return this.buildSwitch(factor);
    }

    const isAuto = !!factor.semantic;

    // 3. 区间模式
    if (factor.mode === Mode.RANGE) {
      if (factor.quantity === Quantity.MULTIPLE) {
        return this.buildListRangeBuilder(factor, isAuto);
      }
      if (isAuto) {
        return this.buildRangePicker(factor);
      }
      return this.buildRangeInput(factor);
    }

    // 4. point 模式
    if (factor.quantity === Quantity.MULTIPLE) {
      return this.buildListBuilder(factor, isAuto);
    }
    if (isAuto) {
      return this.buildPicker(factor);
    }
    return this.buildManualPointSingle(factor);
  }

  private buildSwitch(factor: RuleFactorDefinition): SwitchProperties {
    return { ...buildBase(factor), type: 'Switch' };
  }

  private buildSelect(factor: RuleFactorDefinition, resource: Resource): SelectProperties {
    // SelectProperties 资源类型为 StaticResource | ElementaryDynamicResource
    return {
      ...buildBase(factor),
      type: 'Select',
      resource: resource as SelectProperties['resource'],
    };
  }

  private buildMultipleSelect(
    factor: RuleFactorDefinition,
    resource: Resource
  ): MultipleSelectProperties {
    return {
      ...buildBase(factor),
      type: 'MultipleSelect',
      resource: resource as MultipleSelectProperties['resource'],
    };
  }

  private buildRangeInput(factor: RuleFactorDefinition): RangeInputProperties {
    return { ...buildBase(factor), type: 'RangeInput' };
  }

  private buildRangePicker(factor: RuleFactorDefinition): RangePickerProperties {
    return { ...buildBase(factor), type: 'RangePicker' };
  }

  private buildPicker(factor: RuleFactorDefinition): PickerProperties {
    return { ...buildBase(factor), type: 'Picker' };
  }

  /**
   * manual + point + single
   * string + max 是 number 且 > 100 → TextArea；否则 Input
   * number 也走 Input（Input 内部支持 step/precision）
   */
  private buildManualPointSingle(
    factor: RuleFactorDefinition
  ): InputProperties | TextAreaProperties {
    if (factor.dataType === DataType.STRING) {
      const max = factor.constraints?.max;
      if (typeof max === 'number' && max > 100) {
        return { ...buildBase(factor), type: 'TextArea' };
      }
    }
    return { ...buildBase(factor), type: 'Input' };
  }

  private buildListBuilder(factor: RuleFactorDefinition, isAuto: boolean): ListBuilderProperties {
    const itemConstraints = extractBaseConstraints(factor);
    const itemBase = {
      dataType: factor.dataType,
    } as { dataType: DataType; semantic?: typeof factor.semantic; constraints?: FieldConstraints };

    if (factor.semantic) {
      itemBase.semantic = factor.semantic;
    }
    if (itemConstraints) {
      itemBase.constraints = itemConstraints;
    }

    const props: ListBuilderProperties = {
      name: factor.name,
      title: factor.title,
      type: 'ListBuilder',
      item: {
        type: isAuto ? 'Picker' : 'Input',
        ...itemBase,
      },
    };
    const listConstraints = extractListBaseConstraints(factor);
    if (listConstraints) {
      return { ...props, constraints: listConstraints };
    }
    return props;
  }

  private buildListRangeBuilder(
    factor: RuleFactorDefinition,
    isAuto: boolean
  ): ListRangeBuilderProperties {
    const itemConstraints = extractBaseConstraints(factor);
    const itemBase = { dataType: factor.dataType } as {
      dataType: DataType;
      semantic?: typeof factor.semantic;
      constraints?: FieldConstraints;
    };
    if (factor.semantic) itemBase.semantic = factor.semantic;
    if (itemConstraints) itemBase.constraints = itemConstraints;

    const props: ListRangeBuilderProperties = {
      name: factor.name,
      title: factor.title,
      type: 'ListRangeBuilder',
      item: {
        type: isAuto ? 'RangePicker' : 'RangeInput',
        ...itemBase,
      },
    };
    const listConstraints = extractListBaseConstraints(factor);
    if (listConstraints) {
      return { ...props, constraints: listConstraints };
    }
    return props;
  }
}
