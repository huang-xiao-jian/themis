import { Col, Row, Tabs } from 'antd';
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
      tabPlacement="start"
      items={CASES.map(({ key, label, children }) => ({
        key,
        label,
        children: (
          <Row gutter={16} align="middle" wrap={false}>
            <Col lg={16} md={24}>
              {children}
            </Col>
          </Row>
        ),
      }))}
    />
  );
}
