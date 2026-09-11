import type { RuleWorkspaceScheduler } from '@thesis/core';
import type { ReactElement, ReactNode } from 'react';
export interface SisyphusProviderProps {
  scheduler: RuleWorkspaceScheduler;
  children: ReactNode;
}
export declare function SisyphusProvider(props: SisyphusProviderProps): ReactElement;
