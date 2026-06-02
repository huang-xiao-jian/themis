import type { AtomicRule, AtomicRuleGroup } from '../dsl'

/**
 * 示例规则数据
 */
export const sampleRule1: AtomicRule = {
  id: 'rule-1',
  name: 'employee',
  operator: 'eq',
  threshold: 100,
}

export const sampleRule2: AtomicRule = {
  id: 'rule-2',
  name: 'deliver_city',
  operator: 'in',
  threshold: ['北京', '上海'],
}

export const sampleGroup: AtomicRuleGroup = {
  rules: [sampleRule1, sampleRule2],
}
