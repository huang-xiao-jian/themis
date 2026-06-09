import { describe, expect, it } from 'vitest';
import { createAntdPlugin, SisyphusAntdProvider } from './index';

describe('@sisyphus/antd public API', () => {
  it('should export createAntdPlugin', () => {
    expect(createAntdPlugin).toBeDefined();
  });

  it('should export SisyphusAntdProvider', () => {
    expect(SisyphusAntdProvider).toBeDefined();
  });

  it('should create a plugin with correct name', () => {
    const plugin = createAntdPlugin();
    expect(plugin.name).toBe('antd');
    expect(typeof plugin.onRegister).toBe('function');
  });
});
