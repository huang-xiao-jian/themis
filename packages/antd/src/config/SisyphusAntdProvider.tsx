import type { ReactElement, ReactNode } from 'react';
import type { SisyphusAntdConfig } from './SisyphusAntdConfig';
import { SisyphusAntdContext } from './SisyphusAntdContext';

/** SisyphusAntdProvider 属性 */
export interface SisyphusAntdProviderProps {
  /** antd 适配器配置 */
  readonly config?: SisyphusAntdConfig;
  /** 子元素 */
  readonly children: ReactNode;
}

/** 提供 antd 配置 */
export function SisyphusAntdProvider({
  config = {},
  children,
}: SisyphusAntdProviderProps): ReactElement {
  return <SisyphusAntdContext.Provider value={config}>{children}</SisyphusAntdContext.Provider>;
}
