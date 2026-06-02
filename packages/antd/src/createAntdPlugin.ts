import type { SisyphusPlugin } from '@sisyphus/react';
import { AntdPlugin } from './AntdPlugin';

/** 创建 antd 组件渲染器插件 */
export function createAntdPlugin(): SisyphusPlugin {
  return new AntdPlugin();
}
