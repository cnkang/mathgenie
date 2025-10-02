import type { Problem, Settings } from '@/types';
import { getDefaultGroupingValues } from '@/utils/groupingUtils';

/**
 * Shared test utilities for consistent test setup across the application
 */

/**
 * Create default test settings with consistent grouping values
 */
export const createTestSettings = (overrides: Partial<Settings> = {}): Settings => {
  const defaultGrouping = getDefaultGroupingValues();

  return {
    operations: ['+', '-'],
    numProblems: 20,
    numRange: [1, 20],
    resultRange: [0, 20],
    numOperandsRange: [2, 3],
    allowNegative: false,
    showAnswers: false,
    fontSize: 16,
    lineSpacing: 12,
    paperSize: 'a4',
    ...defaultGrouping,
    ...overrides,
  };
};

/**
 * Create test problems for consistent testing
 */
export const createTestProblems = (count: number = 10): Problem[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    text: `${index + 1} + ${index + 2} = ___`,
    correctAnswer: index + 1 + (index + 2),
  }));
};

/**
 * Create test settings with grouping enabled
 */
export const createGroupedTestSettings = (
  problemsPerGroup: number = 5,
  totalGroups: number = 2,
  overrides: Partial<Settings> = {}
): Settings => {
  return createTestSettings({
    enableGrouping: true,
    problemsPerGroup,
    totalGroups,
    ...overrides,
  });
};

/**
 * Mock translation function for tests
 */
export const mockTranslation = (key: string, params?: Record<string, string | number>): string => {
  // Simple mock that returns the key with interpolated params
  if (params) {
    let result = key;
    Object.entries(params).forEach(([paramKey, value]) => {
      result = result.replace(`{{${paramKey}}}`, String(value));
    });
    return result;
  }
  return key;
};

/**
 * Create mock settings with validation errors for testing
 */
export const createInvalidTestSettings = (
  errorType: 'noOperations' | 'invalidGrouping' | 'invalidRange'
): Settings => {
  const base = createTestSettings();

  switch (errorType) {
    case 'noOperations':
      return { ...base, operations: [] };
    case 'invalidGrouping':
      return { ...base, enableGrouping: true, problemsPerGroup: 0, totalGroups: 0 };
    case 'invalidRange':
      return { ...base, numRange: [20, 1] }; // Invalid range
    default:
      return base;
  }
};
