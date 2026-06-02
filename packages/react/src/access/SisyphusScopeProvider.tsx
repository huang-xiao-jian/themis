import type { ReactElement, ReactNode } from 'react';
import type { SisyphusScope } from './SisyphusScope';
import { SisyphusScopeContext } from './useSisyphusScope';

/** SisyphusScopeProvider 属性 */
export interface SisyphusScopeProviderProps {
  /** Sisyphus 应用实例 */
  scope: SisyphusScope;
  /** 子元素 */
  children: ReactNode;
}

/** 作用域提供者组件 */
export function SisyphusScopeProvider({
  scope,
  children,
}: SisyphusScopeProviderProps): ReactElement {
  return <SisyphusScopeContext.Provider value={scope}>{children}</SisyphusScopeContext.Provider>;
}
