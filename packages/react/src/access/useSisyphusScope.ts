import { createContext, useContext } from 'react';
import type { SisyphusScope } from './SisyphusScope';

/** Sisyphus 作用域 React 上下文 */
export const SisyphusScopeContext = createContext<SisyphusScope | null>(null);

/** 获取 Sisyphus 作用域实例 */
export function useSisyphusScope(): SisyphusScope {
  const scope = useContext(SisyphusScopeContext);
  if (scope === null) {
    throw new Error('[sisyphus] useSisyphusScope must be used within a SisyphusScopeProvider.');
  }
  return scope;
}
