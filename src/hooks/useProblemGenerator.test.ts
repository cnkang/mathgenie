import type { Settings } from '@/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '../../tests/helpers/testUtils';
import { calculateExpression, generateProblem, useProblemGenerator } from './useProblemGenerator';

// Mock crypto for deterministic results
let mockCounter = 0;
const mockCrypto = {
  getRandomValues: vi.fn((arr: Uint32Array) => {
    for (let i = 0; i < arr.length; i++) {
      // Use a predictable sequence that cycles through 1-5
      arr[i] = (mockCounter++ % 5) + 1;
    }
    return arr;
  }),
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

describe('useProblemGenerator utilities', () => {
  beforeEach(() => {
    mockCounter = 0;
    vi.clearAllMocks();
  });

  it('calculateExpression computes correctly', () => {
    expect(calculateExpression([5, 3], ['+'])).toBe(8);
    expect(calculateExpression([10, 4], ['-'])).toBe(6);
    expect(calculateExpression([6, 7], ['*'])).toBe(42);
    expect(calculateExpression([15, 3], ['/'])).toBe(5);
    expect(calculateExpression([5, 3], ['%'])).toBeNull();
  });

  it('generateProblem creates valid problems', () => {
    const settings: Settings = {
      operations: ['+'],
      numProblems: 1,
      numRange: [1, 5],
      resultRange: [0, 10],
      numOperandsRange: [2, 2],
      allowNegative: false,
      showAnswers: true,
      fontSize: 16,
      lineSpacing: 12,
      paperSize: 'a4',
    };
    const problem = generateProblem(settings);
    expect(problem).toMatch(/^\d+ \+ \d+ = \d+$/);
  });
});

describe('useProblemGenerator hook', () => {
  beforeEach(() => {
    mockCounter = 0;
    vi.clearAllMocks();
  });

  const baseSettings: Settings = {
    operations: ['+'],
    numProblems: 2,
    numRange: [1, 5],
    resultRange: [0, 10],
    numOperandsRange: [2, 2],
    allowNegative: false,
    showAnswers: true,
    fontSize: 16,
    lineSpacing: 12,
    paperSize: 'a4',
  };

  it('generates problems and returns success message', () => {
    const validateSettings = vi.fn(() => '');
    const { result } = renderHook(() => useProblemGenerator(baseSettings, false, validateSettings));

    // Wait for initial useEffect to complete
    expect(result.current.problems.length).toBeGreaterThanOrEqual(0);

    let messages: ReturnType<typeof result.current.generateProblems> = {
      error: '',
      warning: '',
      successMessage: '',
    };

    act(() => {
      messages = result.current.generateProblems();
    });

    expect(result.current.problems).toHaveLength(2);
    expect(messages.successMessage).toEqual({
      key: 'messages.success.problemsGenerated',
      params: { count: 2 },
    });
  });

  it('handles validation errors', () => {
    const validateSettings = vi.fn(() => 'errors.noOperations');
    const { result } = renderHook(() => useProblemGenerator(baseSettings, false, validateSettings));

    let messages: ReturnType<typeof result.current.generateProblems> = {
      error: '',
      warning: '',
      successMessage: '',
    };

    act(() => {
      messages = result.current.generateProblems();
    });

    expect(messages.error).toEqual({ key: 'errors.noOperations' });
  });

  it('sets warning for large number of problems', () => {
    const manySettings = { ...baseSettings, numProblems: 60 };
    const validateSettings = vi.fn(() => '');
    const { result } = renderHook(() => useProblemGenerator(manySettings, false, validateSettings));

    let messages: ReturnType<typeof result.current.generateProblems> = {
      error: '',
      warning: '',
      successMessage: '',
    };

    act(() => {
      messages = result.current.generateProblems();
    });

    expect(messages.warning).toEqual({
      key: 'warnings.largeNumberOfProblems',
      params: { count: 60 },
    });
  });

  it('reports error when no problems can be generated', () => {
    const impossible: Settings = { ...baseSettings, resultRange: [100, 200] };
    const validateSettings = vi.fn(() => '');
    const { result } = renderHook(() => useProblemGenerator(impossible, false, validateSettings));

    let messages: ReturnType<typeof result.current.generateProblems> = {
      error: '',
      warning: '',
      successMessage: '',
    };

    act(() => {
      messages = result.current.generateProblems();
    });

    expect(messages.error).toEqual({ key: 'errors.noProblemsGenerated' });
  });
});
