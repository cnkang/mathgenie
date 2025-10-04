import type { Settings } from '../types';

interface UseSettingsValidationReturn {
  isValidationSensitiveField: (field: keyof Settings) => boolean;
  checkRestrictiveSettings: (settings: Settings) => boolean;
}

export const useSettingsValidation = (): UseSettingsValidationReturn => {
  const VALIDATION_SENSITIVE_FIELDS: Array<keyof Settings> = [
    'numProblems',
    'numRange',
    'resultRange',
    'numOperandsRange',
    'operations',
    'enableGrouping',
    'problemsPerGroup',
    'totalGroups',
  ];

  const isValidationSensitiveField = (field: keyof Settings): boolean => {
    return VALIDATION_SENSITIVE_FIELDS.includes(field);
  };

  const checkRestrictiveSettings = (settings: Settings): boolean => {
    const resultRangeSize = settings.resultRange[1] - settings.resultRange[0];
    const numRangeSize = settings.numRange[1] - settings.numRange[0];

    // 计算实际题目总数
    const actualTotalProblems = settings.enableGrouping
      ? settings.problemsPerGroup * settings.totalGroups
      : settings.numProblems;

    const isRestrictiveRange = resultRangeSize < 10 || numRangeSize < 5;
    const hasManyProblems = actualTotalProblems > 50;

    return isRestrictiveRange && hasManyProblems;
  };

  return {
    isValidationSensitiveField,
    checkRestrictiveSettings,
  };
};
