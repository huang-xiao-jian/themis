import type { SisyphusPlugin, ViewRenderer } from '../application/protocol';

/** Sisyphus 实例化参数 */
export interface SisyphusScopeOptions {
  /** 安装组件渲染器插件 */
  plugins: readonly SisyphusPlugin[];
}

/** Sisyphus 应用实例 */
export interface SisyphusScope {
  /** 获取组件渲染器 */
  renderer(): ViewRenderer;
}
