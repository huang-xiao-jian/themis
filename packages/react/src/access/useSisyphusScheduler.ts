import type { RuleWorkspaceScheduler } from '@sisyphus/core';
import { createContext, useContext } from 'react';

export const SisyphusSchedulerContext = createContext<RuleWorkspaceScheduler | null>(null);

export function useSisyphusScheduler(): RuleWorkspaceScheduler {
  const scheduler = useContext(SisyphusSchedulerContext);
  if (scheduler === null) {
    throw new Error('[sisyphus] useSisyphusScheduler must be used within a SisyphusProvider.');
  }
  return scheduler;
}
