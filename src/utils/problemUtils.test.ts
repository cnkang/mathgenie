import { describe, expect, it, vi } from 'vitest';
import { buildExpression, randomInt, randomNonZeroInt } from './problemUtils';
import type { Settings } from '@/types';

// Mock crypto for deterministic tests
const mockCrypto = {
  getRandomValues: vi.fn((arr: Uint32Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = 1;
    }
    return arr;
  }),
};

describe('problemUtils', () => {
  it('randomInt returns number within range', () => {
    const value = randomInt(1, 5, mockCrypto as unknown as Crypto);
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThanOrEqual(5);
  });

  it('randomNonZeroInt excludes zero', () => {
    const value = randomNonZeroInt(-1, 1, mockCrypto as unknown as Crypto);
    expect(value).not.toBe(0);
  });

  it('buildExpression constructs operands and operators', () => {
    const settings: Settings = {
      operations: ['+'],
      numProblems: 1,
      numRange: [1, 1],
      resultRange: [0, 10],
      numOperandsRange: [2, 2],
      allowNegative: false,
      showAnswers: false,
      fontSize: 16,
      lineSpacing: 12,
      paperSize: 'a4',
    };
    const expr = buildExpression(2, settings, randomInt, randomNonZeroInt);
    expect(expr).toEqual({ operands: [1, 1], operators: ['+'] });
  });
});
