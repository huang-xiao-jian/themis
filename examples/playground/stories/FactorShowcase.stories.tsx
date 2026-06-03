import { createAntdPlugin } from '@sisyphus/antd';
import type { RuleFactorDefinition } from '@sisyphus/core';
import { createRuleWorkspace, DataType, Mode, Quantity, Semantic } from '@sisyphus/core';
import { createSisyphusScope, SisyphusScopeProvider, WorkspaceEditor } from '@sisyphus/react';
import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

// ─── 1. BOOLEAN → Switch ──────────────────────────────────────────────
const BOOLEAN: RuleFactorDefinition = {
  name: 'is_active',
  title: '是否激活 (Switch)',
  dataType: DataType.BOOLEAN,
};

// ─── 2. STRING + POINT + SINGLE → Input ───────────────────────────────
const STRING_INPUT: RuleFactorDefinition = {
  name: 'username',
  title: '用户名 (Input)',
  dataType: DataType.STRING,
  mode: Mode.POINT,
  quantity: Quantity.SINGLE,
};

// ─── 3. STRING + POINT + SINGLE + max>100 → TextArea ──────────────────
const STRING_TEXTAREA: RuleFactorDefinition = {
  name: 'description',
  title: '描述 (TextArea)',
  dataType: DataType.STRING,
  mode: Mode.POINT,
  quantity: Quantity.SINGLE,
  constraints: { max: 500 },
};

// ─── 4. NUMBER + POINT + SINGLE → InputNumber ─────────────────────────
const NUMBER_INPUT: RuleFactorDefinition = {
  name: 'age',
  title: '年龄 (InputNumber)',
  dataType: DataType.NUMBER,
  mode: Mode.POINT,
  quantity: Quantity.SINGLE,
  constraints: { min: 0, max: 200 },
};

// ─── 5. STRING + POINT + MULTIPLE → ListBuilder(Input) ────────────────
const STRING_LIST: RuleFactorDefinition = {
  name: 'tags',
  title: '标签 (ListBuilder+Input)',
  dataType: DataType.STRING,
  mode: Mode.POINT,
  quantity: Quantity.MULTIPLE,
};

// ─── 6. NUMBER + POINT + MULTIPLE → ListBuilder(InputNumber) ──────────
const NUMBER_LIST: RuleFactorDefinition = {
  name: 'allowed_levels',
  title: '允许等级 (ListBuilder+InputNumber)',
  dataType: DataType.NUMBER,
  mode: Mode.POINT,
  quantity: Quantity.MULTIPLE,
};

// ─── 7. NUMBER + RANGE + SINGLE → RangeInput ──────────────────────────
const NUMBER_RANGE: RuleFactorDefinition = {
  name: 'order_amount',
  title: '订单金额 (RangeInput)',
  dataType: DataType.NUMBER,
  mode: Mode.RANGE,
  quantity: Quantity.SINGLE,
  constraints: { min: 0, max: 10000 },
};

// ─── 8. NUMBER + RANGE + MULTIPLE → ListRangeBuilder(RangeInput) ──────
const NUMBER_RANGE_LIST: RuleFactorDefinition = {
  name: 'price_ranges',
  title: '价格区间 (ListRangeBuilder+RangeInput)',
  dataType: DataType.NUMBER,
  mode: Mode.RANGE,
  quantity: Quantity.MULTIPLE,
};

// ─── 9. NUMBER + POINT + SINGLE + DATE → Picker ───────────────────────
const DATE_PICKER: RuleFactorDefinition = {
  name: 'start_date',
  title: '开始日期 (Picker+DATE)',
  dataType: DataType.NUMBER,
  semantic: Semantic.DATE,
  mode: Mode.POINT,
  quantity: Quantity.SINGLE,
};

// ─── 10. NUMBER + POINT + MULTIPLE + DATE → ListBuilder(Picker) ───────
const DATE_PICKER_LIST: RuleFactorDefinition = {
  name: 'holidays',
  title: '假日列表 (ListBuilder+Picker+DATE)',
  dataType: DataType.NUMBER,
  semantic: Semantic.DATE,
  mode: Mode.POINT,
  quantity: Quantity.MULTIPLE,
};

// ─── 11. NUMBER + RANGE + SINGLE + DATE → RangePicker ─────────────────
const DATE_RANGE_PICKER: RuleFactorDefinition = {
  name: 'visit_date_range',
  title: '访问日期区间 (RangePicker+DATE)',
  dataType: DataType.NUMBER,
  semantic: Semantic.DATE,
  mode: Mode.RANGE,
  quantity: Quantity.SINGLE,
};

// ─── 12. NUMBER + RANGE + MULTIPLE + DATE → ListRangeBuilder(RangePicker)
const DATE_RANGE_LIST: RuleFactorDefinition = {
  name: 'blackout_periods',
  title: '屏蔽时段 (ListRangeBuilder+RangePicker+DATE)',
  dataType: DataType.NUMBER,
  semantic: Semantic.DATE,
  mode: Mode.RANGE,
  quantity: Quantity.MULTIPLE,
};

// ─── 13. Resource(static) + SINGLE → Select ───────────────────────────
const STATIC_SELECT: RuleFactorDefinition = {
  name: 'deliver_city',
  title: '目标城市 (Select+静态资源)',
  dataType: DataType.STRING,
  resource: {
    name: 'City',
    options: [
      { label: '北京', value: 'bj' },
      { label: '上海', value: 'sh' },
      { label: '广州', value: 'gz' },
      { label: '深圳', value: 'sz' },
    ],
  },
};

// ─── 14. Resource(static) + MULTIPLE → MultipleSelect ─────────────────
const STATIC_MULTIPLE_SELECT: RuleFactorDefinition = {
  name: 'target_cities',
  title: '目标城市列表 (MultipleSelect+静态资源)',
  dataType: DataType.STRING,
  quantity: Quantity.MULTIPLE,
  resource: {
    name: 'City',
    options: [
      { label: '北京', value: 'bj' },
      { label: '上海', value: 'sh' },
      { label: '广州', value: 'gz' },
      { label: '深圳', value: 'sz' },
    ],
  },
};

// ─── 15. Resource(dynamic) + SINGLE → Select ──────────────────────────
const DYNAMIC_SELECT: RuleFactorDefinition = {
  name: 'employee',
  title: '员工 (Select+动态资源)',
  dataType: DataType.STRING,
  resource: {
    name: 'Employee',
    features: ['pagination', 'filter'],
  },
};

// ─── 16. Resource(dynamic) + MULTIPLE → MultipleSelect ────────────────
const DYNAMIC_MULTIPLE_SELECT: RuleFactorDefinition = {
  name: 'employee_list',
  title: '员工列表 (MultipleSelect+动态资源)',
  dataType: DataType.STRING,
  quantity: Quantity.MULTIPLE,
  resource: {
    name: 'Employee',
    features: ['pagination', 'filter'],
  },
};

/** 全量因子定义，覆盖 ThresholderInferrer 所有分支 */
const ALL_FACTORS: readonly RuleFactorDefinition[] = [
  BOOLEAN,
  STRING_INPUT,
  STRING_TEXTAREA,
  NUMBER_INPUT,
  STRING_LIST,
  NUMBER_LIST,
  NUMBER_RANGE,
  NUMBER_RANGE_LIST,
  DATE_PICKER,
  DATE_PICKER_LIST,
  DATE_RANGE_PICKER,
  DATE_RANGE_LIST,
  STATIC_SELECT,
  STATIC_MULTIPLE_SELECT,
  DYNAMIC_SELECT,
  DYNAMIC_MULTIPLE_SELECT,
];

/** Story 装饰器 */
function FactorShowcaseWrapper(): ReactElement {
  const scope = useMemo(() => createSisyphusScope({ plugins: [createAntdPlugin()] }), []);
  const workspace = useMemo(() => createRuleWorkspace({ factors: ALL_FACTORS }), []);

  return (
    <SisyphusScopeProvider scope={scope}>
      <WorkspaceEditor workspace={workspace} />
    </SisyphusScopeProvider>
  );
}

const meta: Meta<typeof FactorShowcaseWrapper> = {
  title: 'FactorShowcase',
  component: FactorShowcaseWrapper,
};

export default meta;

type Story = StoryObj<typeof FactorShowcaseWrapper>;

/**
 * 全量因子组合展示
 *
 * 覆盖 ThresholderInferrer 决策树所有分支：
 *
 * | # | 组合 | 推断组件 |
 * |---|------|---------|
 * | 1 | BOOLEAN | Switch |
 * | 2 | STRING + POINT + SINGLE | Input |
 * | 3 | STRING + POINT + SINGLE + max>100 | TextArea |
 * | 4 | NUMBER + POINT + SINGLE | InputNumber |
 * | 5 | STRING + POINT + MULTIPLE | ListBuilder(Input) |
 * | 6 | NUMBER + POINT + MULTIPLE | ListBuilder(InputNumber) |
 * | 7 | NUMBER + RANGE + SINGLE | RangeInput |
 * | 8 | NUMBER + RANGE + MULTIPLE | ListRangeBuilder(RangeInput) |
 * | 9 | NUMBER + POINT + SINGLE + DATE | Picker |
 * | 10 | NUMBER + POINT + MULTIPLE + DATE | ListBuilder(Picker) |
 * | 11 | NUMBER + RANGE + SINGLE + DATE | RangePicker |
 * | 12 | NUMBER + RANGE + MULTIPLE + DATE | ListRangeBuilder(RangePicker) |
 * | 13 | Resource(static) + SINGLE | Select |
 * | 14 | Resource(static) + MULTIPLE | MultipleSelect |
 * | 15 | Resource(dynamic) + SINGLE | Select |
 * | 16 | Resource(dynamic) + MULTIPLE | MultipleSelect |
 */
export const AllFactors: Story = {};
