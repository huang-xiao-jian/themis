import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const PACKAGES_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../packages');

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@sisyphus/core': resolve(PACKAGES_DIR, 'core/src/index.ts'),
      '@sisyphus/react': resolve(PACKAGES_DIR, 'react/src/index.ts'),
      '@sisyphus/antd': resolve(PACKAGES_DIR, 'antd/src/index.ts'),
    },
    dedupe: ['react', 'react-dom'],
  },
});
