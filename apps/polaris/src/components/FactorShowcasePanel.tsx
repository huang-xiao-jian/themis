import { Tabs } from 'antd';
import type { ReactElement } from 'react';
import {
  AllFactorsCase,
  EditBooleanSwitchCase,
  EditDatePickerCase,
  EditDatePickerListCase,
  EditDateRangeListCase,
  EditDateRangePickerCase,
  EditDynamicMultipleSelectCase,
  EditDynamicSelectCase,
  EditNumberInputCase,
  EditNumberListBuilderCase,
  EditNumberRangeCase,
  EditNumberRangeListCase,
  EditStaticMultipleSelectCase,
  EditStaticSelectCase,
  EditStringListBuilderCase,
  EditStringTextAreaCase,
  EditStringTextInputCase,
} from './FactorShowcase.tsx';
import type { CaseTabItem } from './types.ts';

const CASES: readonly CaseTabItem[] = [
  { key: 'edit-boolean-switch', label: 'BooleanSwitch', children: <EditBooleanSwitchCase /> },
  {
    key: 'edit-string-text-input',
    label: 'StringTextInput',
    children: <EditStringTextInputCase />,
  },
  { key: 'edit-string-text-area', label: 'StringTextArea', children: <EditStringTextAreaCase /> },
  { key: 'edit-number-input', label: 'NumberInput', children: <EditNumberInputCase /> },
  {
    key: 'edit-string-list-builder',
    label: 'StringListBuilder',
    children: <EditStringListBuilderCase />,
  },
  {
    key: 'edit-number-list-builder',
    label: 'NumberListBuilder',
    children: <EditNumberListBuilderCase />,
  },
  { key: 'edit-number-range', label: 'NumberRange', children: <EditNumberRangeCase /> },
  {
    key: 'edit-number-range-list',
    label: 'NumberRangeList',
    children: <EditNumberRangeListCase />,
  },
  { key: 'edit-date-picker', label: 'DatePicker', children: <EditDatePickerCase /> },
  { key: 'edit-date-picker-list', label: 'DatePickerList', children: <EditDatePickerListCase /> },
  {
    key: 'edit-date-range-picker',
    label: 'DateRangePicker',
    children: <EditDateRangePickerCase />,
  },
  { key: 'edit-date-range-list', label: 'DateRangeList', children: <EditDateRangeListCase /> },
  { key: 'edit-static-select', label: 'StaticSelect', children: <EditStaticSelectCase /> },
  {
    key: 'edit-static-multiple-select',
    label: 'StaticMultipleSelect',
    children: <EditStaticMultipleSelectCase />,
  },
  { key: 'edit-dynamic-select', label: 'DynamicSelect', children: <EditDynamicSelectCase /> },
  {
    key: 'edit-dynamic-multiple-select',
    label: 'DynamicMultipleSelect',
    children: <EditDynamicMultipleSelectCase />,
  },
  { key: 'all-factors', label: 'AllFactors', children: <AllFactorsCase /> },
];

export function FactorShowcasePanel(): ReactElement {
  return (
    <Tabs
      type="card"
      items={CASES.map(({ key, label, children }) => ({
        key,
        label,
        children: <div style={{ padding: '16px 0' }}>{children}</div>,
      }))}
    />
  );
}
