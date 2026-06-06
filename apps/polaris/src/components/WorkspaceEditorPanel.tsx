import { Tabs } from 'antd';
import type { ReactElement } from 'react';
import { EmptyWorkspaceCase, MultiGroupsCase } from './WorkspaceEditorShowcase.tsx';
import type { CaseTabItem } from './types.ts';

const CASES: readonly CaseTabItem[] = [
  { key: 'empty', label: 'Empty', children: <EmptyWorkspaceCase /> },
  { key: 'multi-groups', label: 'MultiGroups', children: <MultiGroupsCase /> },
];

export function WorkspaceEditorPanel(): ReactElement {
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
