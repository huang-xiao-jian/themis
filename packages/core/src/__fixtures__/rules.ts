import type { AtomicRule, AtomicRuleGroup } from '../dsl';

/**
 * 示例规则数据
 */
export const SAMPLE_RULE_1: AtomicRule = {
  id: 'rule-1',
  name: 'employee',
  operator: 'eq',
  threshold: 100,
};

export const SAMPLE_RULE_2: AtomicRule = {
  id: 'rule-2',
  name: 'deliver_city',
  operator: 'in',
  threshold: ['北京', '上海'],
};

export const SAMPLE_GROUP: AtomicRuleGroup = {
  id: 'group-1',
  rules: [SAMPLE_RULE_1, SAMPLE_RULE_2],
};
