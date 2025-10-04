import type { Problem, Settings } from '@/types';

/**
 * Shared grouping utilities for consistent behavior across components
 */

/**
 * Calculate the actual total number of problems based on grouping settings
 */
export const calculateActualTotalProblems = (settings: Settings): number => {
  return settings.enableGrouping
    ? settings.problemsPerGroup * settings.totalGroups
    : settings.numProblems;
};

/**
 * Get default grouping values for consistent initialization
 */
export const getDefaultGroupingValues = () => ({
  enableGrouping: false,
  problemsPerGroup: 20,
  totalGroups: 1,
});

/**
 * Validate that a number is a positive integer
 */
export const isPositiveInteger = (value: number): boolean => {
  return Number.isInteger(value) && value > 0;
};

/**
 * Split problems into groups based on settings
 */
export const splitProblemsIntoGroups = (problems: Problem[], settings: Settings): Problem[][] => {
  if (!settings.enableGrouping) {
    return [problems];
  }

  const groups: Problem[][] = [];
  for (let i = 0; i < settings.totalGroups; i++) {
    const startIndex = i * settings.problemsPerGroup;
    const endIndex = Math.min(startIndex + settings.problemsPerGroup, problems.length);
    const group = problems.slice(startIndex, endIndex);
    groups.push(group);
  }

  return groups;
};

/**
 * Check if a group has problems
 */
export const hasProblems = (group: Problem[]): boolean => {
  return group.length > 0;
};

/**
 * Get group title with proper internationalization fallback
 */
export const getGroupTitle = (
  groupIndex: number,
  t: (key: string, params?: Record<string, string | number>) => string
): string => {
  return t('results.groupTitle', { number: groupIndex + 1 }) || `Group ${groupIndex + 1}`;
};

/**
 * Get empty group placeholder text
 */
export const getEmptyGroupText = (
  groupIndex: number,
  t: (key: string, params?: Record<string, string | number>) => string
): string => {
  return (
    t('problems.emptyGroup', { group: groupIndex + 1 }) || `Group ${groupIndex + 1} (no problems)`
  );
};
