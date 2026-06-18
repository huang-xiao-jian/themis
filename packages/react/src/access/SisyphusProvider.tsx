import type { RuleWorkspaceScheduler } from '@sisyphus/core';
import type { ReactElement, ReactNode } from 'react';
import { SisyphusSchedulerContext } from './useSisyphusScheduler';

export interface SisyphusProviderProps {
  scheduler: RuleWorkspaceScheduler;
  children: ReactNode;
}

export function SisyphusProvider(props: SisyphusProviderProps): ReactElement {
  return (
    <SisyphusSchedulerContext.Provider value={props.scheduler}>
      {props.children}
    </SisyphusSchedulerContext.Provider>
  );
}
