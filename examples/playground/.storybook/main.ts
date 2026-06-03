import { pluginReact } from '@rsbuild/plugin-react';
import type { StorybookConfig } from 'storybook-react-rsbuild';

import { dirname, resolve } from 'path';

import { fileURLToPath } from 'url';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

/** workspace 包根目录 */
const PACKAGES_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages');

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-onboarding'),
  ],
  framework: getAbsolutePath('storybook-react-rsbuild'),
  rsbuildFinal(config) {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        // 直接指向源码，避免 dist 重编译期间的模块解析失败
        '@sisyphus/core': resolve(PACKAGES_DIR, 'core/src/index.ts'),
        '@sisyphus/react': resolve(PACKAGES_DIR, 'react/src/index.ts'),
        '@sisyphus/antd': resolve(PACKAGES_DIR, 'antd/src/index.ts'),
      },
    };
    config.plugins = [...(config.plugins ?? []), pluginReact()];
    return config;
  },
};
export default config;
