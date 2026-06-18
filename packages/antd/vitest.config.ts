import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@sisyphus/core': resolve(__dirname, '../core/src/index.ts'),
      '@sisyphus/react': resolve(__dirname, '../react/src/index.ts'),
      '@sisyphus/antd': resolve(__dirname, './src/index.ts'),
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
  },
});
