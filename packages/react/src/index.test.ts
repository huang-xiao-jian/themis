import { describe, expect, it } from 'vitest';
import { SisyphusProvider, useSisyphusScheduler } from './index';

describe('@sisyphus/react public API', () => {
  it('should export access layer API', () => {
    expect(SisyphusProvider).toBeDefined();
    expect(useSisyphusScheduler).toBeDefined();
  });
});
