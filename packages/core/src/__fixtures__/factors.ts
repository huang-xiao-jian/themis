import { DataType } from '../dsl/DataType'
import { Mode } from '../dsl/Mode'
import { Quantity } from '../dsl/Quantity'
import { Semantic } from '../dsl/Semantic'
import type { RuleFactorDefinition } from '../dsl'

/**
 * 9 种关键组合的 DSL fixture，用于测试推断器/调度器
 */

export const booleanFactor: RuleFactorDefinition = {
  name: 'is_active',
  title: '是否激活',
  dataType: DataType.BOOLEAN,
}

export const stringPointSingleFactor: RuleFactorDefinition = {
  name: 'employee',
  title: '员工',
  dataType: DataType.STRING,
  mode: Mode.POINT,
  quantity: Quantity.SINGLE,
}

export const stringPointMultipleFactor: RuleFactorDefinition = {
  name: 'tags',
  title: '标签',
  dataType: DataType.STRING,
  mode: Mode.POINT,
  quantity: Quantity.MULTIPLE,
}

export const numberPointSingleFactor: RuleFactorDefinition = {
  name: 'age',
  title: '年龄',
  dataType: DataType.NUMBER,
  mode: Mode.POINT,
  quantity: Quantity.SINGLE,
}

export const numberPointMultipleFactor: RuleFactorDefinition = {
  name: 'allowed_levels',
  title: '允许的等级',
  dataType: DataType.NUMBER,
  mode: Mode.POINT,
  quantity: Quantity.MULTIPLE,
}

export const numberRangeSingleFactor: RuleFactorDefinition = {
  name: 'order_amount',
  title: '订单金额',
  dataType: DataType.NUMBER,
  mode: Mode.RANGE,
  quantity: Quantity.SINGLE,
}

export const numberRangeMultipleFactor: RuleFactorDefinition = {
  name: 'price_ranges',
  title: '价格区间',
  dataType: DataType.NUMBER,
  mode: Mode.RANGE,
  quantity: Quantity.MULTIPLE,
}

export const dateRangeSingleFactor: RuleFactorDefinition = {
  name: 'visit_date',
  title: '访问日期',
  dataType: DataType.NUMBER,
  semantic: Semantic.DATE,
  mode: Mode.RANGE,
  quantity: Quantity.SINGLE,
}

export const staticResourceFactor: RuleFactorDefinition = {
  name: 'deliver_city',
  title: '目标城市',
  dataType: DataType.STRING,
  resource: {
    name: 'City',
    options: [
      { label: '北京', value: 'bj' },
      { label: '上海', value: 'sh' },
    ],
  },
}

export const dynamicResourceFactor: RuleFactorDefinition = {
  name: 'employee_dynamic',
  title: '员工',
  dataType: DataType.STRING,
  resource: {
    name: 'Employee',
    features: ['pagination', 'filter'],
  },
}

export const stringLongTextFactor: RuleFactorDefinition = {
  name: 'description',
  title: '描述',
  dataType: DataType.STRING,
  constraints: { max: 500 },
}

export const stringShortTextFactor: RuleFactorDefinition = {
  name: 'short_text',
  title: '短文本',
  dataType: DataType.STRING,
  constraints: { max: 50 },
}

export const allFactors: readonly RuleFactorDefinition[] = [
  booleanFactor,
  stringPointSingleFactor,
  stringPointMultipleFactor,
  numberPointSingleFactor,
  numberPointMultipleFactor,
  numberRangeSingleFactor,
  numberRangeMultipleFactor,
  dateRangeSingleFactor,
  staticResourceFactor,
  dynamicResourceFactor,
]
