import type { RuleFactorDefinition } from '../dsl'

/**
 * 9 种关键组合的 DSL fixture，用于测试推断器/调度器
 */

export const booleanFactor: RuleFactorDefinition = {
  name: 'is_active',
  title: '是否激活',
  dataType: 'boolean',
}

export const stringPointSingleFactor: RuleFactorDefinition = {
  name: 'employee',
  title: '员工',
  dataType: 'string',
  mode: 'point',
  quantity: 'single',
}

export const stringPointMultipleFactor: RuleFactorDefinition = {
  name: 'tags',
  title: '标签',
  dataType: 'string',
  mode: 'point',
  quantity: 'multiple',
}

export const numberPointSingleFactor: RuleFactorDefinition = {
  name: 'age',
  title: '年龄',
  dataType: 'number',
  mode: 'point',
  quantity: 'single',
}

export const numberPointMultipleFactor: RuleFactorDefinition = {
  name: 'allowed_levels',
  title: '允许的等级',
  dataType: 'number',
  mode: 'point',
  quantity: 'multiple',
}

export const numberRangeSingleFactor: RuleFactorDefinition = {
  name: 'order_amount',
  title: '订单金额',
  dataType: 'number',
  mode: 'range',
  quantity: 'single',
}

export const numberRangeMultipleFactor: RuleFactorDefinition = {
  name: 'price_ranges',
  title: '价格区间',
  dataType: 'number',
  mode: 'range',
  quantity: 'multiple',
}

export const dateRangeSingleFactor: RuleFactorDefinition = {
  name: 'visit_date',
  title: '访问日期',
  dataType: 'number',
  semantic: 'date',
  mode: 'range',
  quantity: 'single',
}

export const staticResourceFactor: RuleFactorDefinition = {
  name: 'deliver_city',
  title: '目标城市',
  dataType: 'string',
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
  dataType: 'string',
  resource: {
    name: 'Employee',
    features: ['pagination', 'filter'],
  },
}

export const stringLongTextFactor: RuleFactorDefinition = {
  name: 'description',
  title: '描述',
  dataType: 'string',
  constraints: { max: 500 },
}

export const stringShortTextFactor: RuleFactorDefinition = {
  name: 'short_text',
  title: '短文本',
  dataType: 'string',
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
