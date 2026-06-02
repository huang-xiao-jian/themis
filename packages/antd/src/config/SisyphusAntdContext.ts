import { createContext } from 'react';
import { DEFAULT_SISYPHUS_ANTD_CONFIG, type SisyphusAntdConfig } from './SisyphusAntdConfig';

/** Sisyphus antd 配置上下文 */
export const SisyphusAntdContext = createContext<SisyphusAntdConfig>(DEFAULT_SISYPHUS_ANTD_CONFIG);
