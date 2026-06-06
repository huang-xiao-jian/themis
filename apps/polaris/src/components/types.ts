import type { ReactElement } from 'react';

export interface CaseTabItem {
  key: string;
  label: string;
  children: ReactElement;
}
