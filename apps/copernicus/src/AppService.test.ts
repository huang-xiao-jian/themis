import { describe, expect, it } from 'vitest';
import { AppService } from './AppService.js';

describe('AppService', () => {
  it('returns the default hello-world response', () => {
    const appService = new AppService();

    expect(appService.getHello()).toBe('Hello World!');
  });
});
