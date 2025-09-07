import { afterEach, beforeEach, vi } from 'vitest';

export type ViteMode = 'development' | 'production' | 'test';

export const setViteEnv = (mode: ViteMode): void => {
  vi.stubEnv('MODE', mode);
  vi.stubEnv('DEV', String(mode === 'development') as any);
  vi.stubEnv('PROD', String(mode === 'production') as any);
  (import.meta.env as any).MODE = mode;
  (import.meta.env as any).DEV = mode === 'development';
  (import.meta.env as any).PROD = mode === 'production';
};

export const resetViteEnv = (): void => {
  vi.unstubAllEnvs();
};

export const useViteEnv = (mode: ViteMode = 'test'): void => {
  beforeEach(() => setViteEnv(mode));
  afterEach(() => resetViteEnv());
};
