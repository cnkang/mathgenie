import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { calculateExpression, generateProblem, useProblemGenerator } from './useProblemGenerator';
import type { Settings } from '@/types';

// Mock crypto for deterministic results
const mockCrypto = {
  getRandomValues: vi.fn((arr: Uint32Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = i + 1;
    }
    return arr;
  }),
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

describe('useProblemGenerator utilities', () => {
  it('calculateExpression computes correctly', () => {
    expect(calculateExpression([5, 3], ['+'])).toBe(8);
    expect(calculateExpression([10, 4], ['-'])).toBe(6);
    expect(calculateExpression([6, 7], ['*'])).toBe(42);
    expect(calculateExpression([15, 3], ['/'])).toBe(5);
    expect(calculateExpression([5, 3], ['%'])).toBeNull();
  });

  it('generateProblem creates deterministic problems', () => {
    const settings: Settings = {
      operations: ['+'],
      numProblems: 1,
      numRange: [1, 1],
      resultRange: [0, 10],
      numOperandsRange: [2, 2],
      allowNegative: false,
      showAnswers: true,
      fontSize: 16,
      lineSpacing: 12,
      paperSize: 'a4',
    };
    expect(generateProblem(settings)).toBe('1 + 1 = 2');
  });
});

describe('useProblemGenerator hook', () => {
  const baseSettings: Settings = {
    operations: ['+'],
    numProblems: 2,
    numRange: [1, 1],
    resultRange: [0, 10],
    numOperandsRange: [2, 2],
    allowNegative: false,
    showAnswers: true,
    fontSize: 16,
    lineSpacing: 12,
    paperSize: 'a4',
  };

  it('generates problems and success message', () => {
    const { result } = renderHook(() => useProblemGenerator(baseSettings, false, () => ''));
    act(() => {
      result.current.generateProblems();
    });
    expect(result.current.problems).toHaveLength(2);
    expect(result.current.successMessage).toEqual({
      key: 'messages.success.problemsGenerated',
      params: { count: 2 },
    });
  });

  it('handles validation errors', () => {
    const validate = () => ({ key: 'errors.noOperations' });
    const { result } = renderHook(() => useProblemGenerator(baseSettings, false, validate));
    act(() => {
      result.current.generateProblems();
    });
    expect(result.current.error).toEqual({ key: 'errors.noOperations' });
  });

  it('sets warning for large number of problems', () => {
    const manySettings = { ...baseSettings, numProblems: 60 };
    const { result } = renderHook(() => useProblemGenerator(manySettings, false, () => ''));
    act(() => {
      result.current.generateProblems();
    });
    expect(result.current.warning).toEqual({
      key: 'warnings.largeNumberOfProblems',
      params: { count: 60 },
    });
  });

  it('reports error when no problems can be generated', () => {
    const impossible: Settings = { ...baseSettings, resultRange: [100, 200] };
    const { result } = renderHook(() => useProblemGenerator(impossible, false, () => ''));
    act(() => {
      result.current.generateProblems();
    });
    expect(result.current.error).toEqual({ key: 'errors.noProblemsGenerated' });
  });
});
