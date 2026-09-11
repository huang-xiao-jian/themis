import type { ThresholdComponentProperties } from '../component/ThresholdComponentProperties';
import type { RuleFactorDefinition } from '../dsl/RuleFactorDefinition';
import type { ResourceFactory } from '../factory/ResourceFactory';
/**
 * Thresholder 推断器
 *
 * 根据 RuleFactorDefinition 推断中间形态的表单组件
 * 决策图见 [interpreter.md 第 207-250 行](../specs/interpreter.md)
 */
export declare class ThresholderInferrer {
  private readonly resourceFactory;
  constructor(resourceFactory: ResourceFactory);
  infer(factor: RuleFactorDefinition): ThresholdComponentProperties;
  private buildSwitch;
  private buildSelect;
  private buildMultipleSelect;
  private buildRangeInput;
  private buildRangePicker;
  private buildPicker;
  /**
   * manual + point + single
   * string + max 是 number 且 > 100 → TextArea
   * number → InputNumber
   * 其余 → Input
   */
  private buildManualPointSingle;
  private buildListBuilder;
  private buildListRangeBuilder;
}
