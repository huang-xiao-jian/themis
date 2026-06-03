import { createAntdPlugin } from '@sisyphus/antd';
import type { AtomicRule, AtomicRuleGroup, RuleFactorDefinition } from '@sisyphus/core';
import {
  createRuleWorkspace,
  DataType,
  Mode,
  providePaginatedFilterableFetcher,
  Quantity,
  Semantic,
} from '@sisyphus/core';
import { createSisyphusScope, SisyphusScopeProvider, WorkspaceEditor } from '@sisyphus/react';
import type { Meta, StoryObj } from '@storybook/react';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

// ─── Factor Definitions ────────────────────────────────────────────────

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

// ─── Shared Infrastructure ─────────────────────────────────────────────

/** 动态资源 mock Fetcher（pagination + filter） */
const MOCK_FETCHERS = [
  providePaginatedFilterableFetcher({
    fetch: async () => ({ data: [], page: 1, pageSize: 20, total: 0 }),
  }),
];

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

/** 创建单因子编辑模式的 Story wrapper */
function createEditStory(factor: RuleFactorDefinition, rule: AtomicRule): () => ReactElement {
  return function EditStory(): ReactElement {
    const scope = useMemo(() => createSisyphusScope({ plugins: [createAntdPlugin()] }), []);
    const workspace = useMemo(
      () =>
        createRuleWorkspace({
          factors: [factor],
          fetchers: MOCK_FETCHERS,
          ruleGroups: [{ id: 'group-1', rules: [rule] }] satisfies readonly AtomicRuleGroup[],
        }),
      []
    );

    return (
      <SisyphusScopeProvider scope={scope}>
        <WorkspaceEditor workspace={workspace} />
      </SisyphusScopeProvider>
    );
  };
}

/** 全量因子新建模式 wrapper */
function AllFactorsWrapper(): ReactElement {
  const scope = useMemo(() => createSisyphusScope({ plugins: [createAntdPlugin()] }), []);
  const workspace = useMemo(
    () => createRuleWorkspace({ factors: ALL_FACTORS, fetchers: MOCK_FETCHERS }),
    []
  );

  return (
    <SisyphusScopeProvider scope={scope}>
      <WorkspaceEditor workspace={workspace} />
    </SisyphusScopeProvider>
  );
}

// ─── Meta ──────────────────────────────────────────────────────────────

const meta: Meta<typeof AllFactorsWrapper> = {
  title: 'FactorShowcase',
  component: AllFactorsWrapper,
};

export default meta;

type Story = StoryObj<typeof AllFactorsWrapper>;

// ─── Stories: 新建模式 ─────────────────────────────────────────────────

/**
 * 全量因子组合展示（新建模式）
 *
 * 覆盖 ThresholderInferrer 决策树所有 16 种分支
 */
export const AllFactors: Story = {};

// ─── Stories: 编辑模式（每个因子组合独立 Story） ───────────────────────

/** 1. BOOLEAN → Switch | 阈值: true */
export const EditBooleanSwitch: Story = {
  render: createEditStory(BOOLEAN, {
    id: 'r-1',
    name: 'is_active',
    operator: 'is',
    threshold: true,
  }),
};

/** 2. STRING + POINT + SINGLE → Input | 阈值: 'admin' */
export const EditStringInput: Story = {
  render: createEditStory(STRING_INPUT, {
    id: 'r-2',
    name: 'username',
    operator: 'contains',
    threshold: 'admin',
  }),
};

/** 3. STRING + POINT + SINGLE + max>100 → TextArea | 阈值: '这是一段较长的描述文本' */
export const EditStringTextArea: Story = {
  render: createEditStory(STRING_TEXTAREA, {
    id: 'r-3',
    name: 'description',
    operator: '=',
    threshold: '这是一段较长的描述文本',
  }),
};

/** 4. NUMBER + POINT + SINGLE → InputNumber | 阈值: 18 */
export const EditNumberInputNumber: Story = {
  render: createEditStory(NUMBER_INPUT, {
    id: 'r-4',
    name: 'age',
    operator: '>=',
    threshold: 18,
  }),
};

/** 5. STRING + POINT + MULTIPLE → ListBuilder(Input) | 阈值: ['前端', 'React', 'TypeScript'] */
export const EditStringListBuilder: Story = {
  render: createEditStory(STRING_LIST, {
    id: 'r-5',
    name: 'tags',
    operator: 'in',
    threshold: ['前端', 'React', 'TypeScript'],
  }),
};

/** 6. NUMBER + POINT + MULTIPLE → ListBuilder(InputNumber) | 阈值: [1, 3, 5] */
export const EditNumberListBuilder: Story = {
  render: createEditStory(NUMBER_LIST, {
    id: 'r-6',
    name: 'allowed_levels',
    operator: 'in',
    threshold: [1, 3, 5],
  }),
};

/** 7. NUMBER + RANGE + SINGLE → RangeInput | 阈值: [100, 5000] */
export const EditNumberRange: Story = {
  render: createEditStory(NUMBER_RANGE, {
    id: 'r-7',
    name: 'order_amount',
    operator: 'between',
    threshold: [100, 5000],
  }),
};

/** 8. NUMBER + RANGE + MULTIPLE → ListRangeBuilder(RangeInput) | 阈值: [[10,50], [100,200]] */
export const EditNumberRangeList: Story = {
  render: createEditStory(NUMBER_RANGE_LIST, {
    id: 'r-8',
    name: 'price_ranges',
    operator: 'between any',
    threshold: [
      [10, 50],
      [100, 200],
    ],
  }),
};

/** 9. NUMBER + POINT + SINGLE + DATE → Picker | 阈值: timestamp */
export const EditDatePicker: Story = {
  render: createEditStory(DATE_PICKER, {
    id: 'r-9',
    name: 'start_date',
    operator: '=',
    threshold: 1717372800000,
  }),
};

/** 10. NUMBER + POINT + MULTIPLE + DATE → ListBuilder(Picker) | 阈值: [timestamp, timestamp] */
export const EditDatePickerList: Story = {
  render: createEditStory(DATE_PICKER_LIST, {
    id: 'r-10',
    name: 'holidays',
    operator: 'in',
    threshold: [1717372800000, 1719964800000],
  }),
};

/** 11. NUMBER + RANGE + SINGLE + DATE → RangePicker | 阈值: [timestamp, timestamp] */
export const EditDateRangePicker: Story = {
  render: createEditStory(DATE_RANGE_PICKER, {
    id: 'r-11',
    name: 'visit_date_range',
    operator: 'between',
    threshold: [1717372800000, 1719964800000],
  }),
};

/** 12. NUMBER + RANGE + MULTIPLE + DATE → ListRangeBuilder(RangePicker) | 阈值: [[ts,ts], [ts,ts]] */
export const EditDateRangeList: Story = {
  render: createEditStory(DATE_RANGE_LIST, {
    id: 'r-12',
    name: 'blackout_periods',
    operator: 'between any',
    threshold: [
      [1717372800000, 1717977600000],
      [1719964800000, 1720569600000],
    ],
  }),
};

/** 13. Resource(static) + SINGLE → Select | 阈值: 'sh' */
export const EditStaticSelect: Story = {
  render: createEditStory(STATIC_SELECT, {
    id: 'r-13',
    name: 'deliver_city',
    operator: '=',
    threshold: 'sh',
  }),
};

/** 14. Resource(static) + MULTIPLE → MultipleSelect | 阈值: ['bj', 'sh', 'gz'] */
export const EditStaticMultipleSelect: Story = {
  render: createEditStory(STATIC_MULTIPLE_SELECT, {
    id: 'r-14',
    name: 'target_cities',
    operator: 'in',
    threshold: ['bj', 'sh', 'gz'],
  }),
};

/** 15. Resource(dynamic) + SINGLE → Select | 阈值: 'emp-001' */
export const EditDynamicSelect: Story = {
  render: createEditStory(DYNAMIC_SELECT, {
    id: 'r-15',
    name: 'employee',
    operator: '=',
    threshold: 'emp-001',
  }),
};

/** 16. Resource(dynamic) + MULTIPLE → MultipleSelect | 阈值: ['emp-001', 'emp-002'] */
export const EditDynamicMultipleSelect: Story = {
  render: createEditStory(DYNAMIC_MULTIPLE_SELECT, {
    id: 'r-16',
    name: 'employee_list',
    operator: 'in',
    threshold: ['emp-001', 'emp-002'],
  }),
};
