import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@thesis/core': resolve(__dirname, '../core/src/index.ts'),
      '@thesis/react': resolve(__dirname, './src/index.ts'),
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
  },
});
