import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildSafeEnv, resolveBin } from '../../scripts/exec-utils';
import { validateFilePatterns } from '../../scripts/css-html-quality-check';
import { existsSync } from 'node:fs';

describe('css-html-quality-check helpers', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Ensure dangerous env vars exist to validate removal
    process.env.LD_PRELOAD = 'injected';
    process.env.LD_LIBRARY_PATH = 'injected';
    process.env.DYLD_INSERT_LIBRARIES = 'injected';
    process.env.DYLD_LIBRARY_PATH = 'injected';
    // Add both PATH variants
    process.env.PATH = '/usr/local/bin:/usr/bin';
    (process.env as any).Path = 'C\\Windows\\System32';
  });

  afterEach(() => {
    // Restore original env
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  it('buildSafeEnv should remove dangerous vars and drop PATH', () => {
    const env = buildSafeEnv();

    expect(env.LD_PRELOAD).toBeUndefined();
    expect(env.LD_LIBRARY_PATH).toBeUndefined();
    expect(env.DYLD_INSERT_LIBRARIES).toBeUndefined();
    expect(env.DYLD_LIBRARY_PATH).toBeUndefined();

    // PATH should be removed to avoid PATH-based command resolution
    expect(env.PATH).toBeUndefined();

    // Normalizes Path casing away
    expect((env as any).Path).toBeUndefined();
  });

  it('validateFilePatterns should accept safe patterns', () => {
    expect(validateFilePatterns(['src/**/*.css', 'public/**/*.html'])).toBe(true);
  });

  it('validateFilePatterns should reject patterns with dangerous characters', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(validateFilePatterns(['src/**/*.css; rm -rf /'])).toBe(false);
    expect(validateFilePatterns(['src/**/..|..'])).toBe(false);
    errSpy.mockRestore();
  });

  it('validateFilePatterns should reject overly long patterns', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const long = 'a'.repeat(201);
    expect(validateFilePatterns([long])).toBe(false);
    errSpy.mockRestore();
  });

  it('resolveBin should resolve stylelint CLI from package.json bin', () => {
    const p = resolveBin('stylelint', 'stylelint');
    expect(typeof p).toBe('string');
    expect(existsSync(p)).toBe(true);
  });

  it('resolveBin should resolve html-validate CLI from package.json bin', () => {
    const p = resolveBin('html-validate', 'html-validate');
    expect(typeof p).toBe('string');
    expect(existsSync(p)).toBe(true);
  });
});
