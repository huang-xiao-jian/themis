# 领域层

封装核心业务规则，包括规则推断机制、操作符映射逻辑、阈值属性计算逻辑。根据 `RuleFactorDefinition` 定义推断可用 `operators` 和 `thresholder`，以及 `AtomicRuleGroup` 级别的可选规则因子选项推断

## 前置依赖

- [规则配置内核](./spec.md)
- [规则因子解释器](../interpreter.md)

## 核心推断逻辑

- `AtomicRule` 级别根据 `RuleFactorDefinition` 推断可用 `operators` 和 `thresholder`，参考 [规则因子解释器](../interpreter.md) 中的推断机制
- `AtomicRuleGroup` 级别的规则因子选项推断，参考 [规则及规则因子描述](../spec.md) 中的规则配置约束章节

## 推断器类声明

```ts
/**
 * 操作符推断器
 *
 * 根据 dataType + semantic 确定"数据域"，再结合 mode（点/区间）和 quantity（单/多）确定"操作域"
 */
class OperatorInferrer {
  infer(factor: RuleFactorDefinition): readonly FieldDataSource[];
}

/**
 * 阈值渲染组件属性推断器
 *
 * 根据 RuleFactorDefinition 推断中间形态的表单组件 + 表单组件属性
 */
class ThresholderInferrer {
  infer(factor: RuleFactorDefinition): ThresholdComponentProperties;
}
```
