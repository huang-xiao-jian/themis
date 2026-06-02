import { DefaultComponentRenderer } from '../application/DefaultComponentRenderer';
import { DefaultComponentRendererRegistry } from '../application/DefaultComponentRendererRegistry';
import type { SisyphusScope, SisyphusScopeOptions } from './SisyphusScope';

/** 创建 Sisyphus 应用实例 */
export function createSisyphusScope(options: SisyphusScopeOptions): SisyphusScope {
  const registry = new DefaultComponentRendererRegistry();
  const renderer = new DefaultComponentRenderer(registry);

  for (const plugin of options.plugins) {
    plugin.install({ registry });
  }

  return {
    renderer() {
      return renderer;
    },
  };
}
