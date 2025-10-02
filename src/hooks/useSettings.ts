import type { Operation, Settings } from '@/types';
import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

// Constants to avoid duplicate strings
const SETTINGS_STORAGE_KEY = 'mathgenie-settings';

const defaultSettings: Settings = {
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
  // 分组设置默认值
  enableGrouping: false,
  problemsPerGroup: 20,
  totalGroups: 1,
};

const isValidArray = (value: unknown, expectedLength?: number): value is unknown[] => {
  return Array.isArray(value) && (expectedLength === undefined || value.length === expectedLength);
};

const isValidOperationArray = (value: unknown): value is Operation[] => {
  if (!Array.isArray(value)) {
    return false;
  }
  const validOperations: Operation[] = ['+', '-', '*', '/', '×', '÷'];
  return value.every(op => typeof op === 'string' && validOperations.includes(op as Operation));
};

const validateAndMergeSettings = (parsed: unknown): Settings => {
  const parsedObj = parsed as Record<string, unknown>;

  return {
    ...defaultSettings,
    ...parsedObj,
    operations: isValidOperationArray(parsedObj.operations)
      ? parsedObj.operations
      : defaultSettings.operations,
    numRange: isValidArray(parsedObj.numRange, 2)
      ? (parsedObj.numRange as [number, number])
      : defaultSettings.numRange,
    resultRange: isValidArray(parsedObj.resultRange, 2)
      ? (parsedObj.resultRange as [number, number])
      : defaultSettings.resultRange,
    numOperandsRange: isValidArray(parsedObj.numOperandsRange, 2)
      ? (parsedObj.numOperandsRange as [number, number])
      : defaultSettings.numOperandsRange,
  };
};

const loadSettings = (): Settings => {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!saved) {
      return defaultSettings;
    }

    const parsed = JSON.parse(saved);
    return validateAndMergeSettings(parsed);
  } catch (error) {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    devWarn('Failed to load settings from localStorage:', error);
    return defaultSettings;
  }
};

const devWarn = (...args: unknown[]): void => {
  if (import.meta.env.DEV) {
    console.warn(...args);
  }
};

interface UseSettingsResult {
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings>>;
  validateSettings: (newSettings: Settings) => string;
}

export const useSettings = (): UseSettingsResult => {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      devWarn('Failed to save settings to localStorage:', error);
    }
  }, [settings]);

  const validateSettings = useCallback((newSettings: Settings): string => {
    // 计算实际题目总数
    const actualTotalProblems = newSettings.enableGrouping
      ? newSettings.problemsPerGroup * newSettings.totalGroups
      : newSettings.numProblems;

    const validations = [
      { condition: newSettings.operations.length === 0, error: 'errors.noOperations' },
      {
        condition: newSettings.numProblems <= 0 || newSettings.numProblems > 50000,
        error: 'errors.invalidProblemCount',
      },
      {
        condition: actualTotalProblems > 50000,
        error: 'errors.invalidTotalProblemCount',
      },
      {
        condition:
          newSettings.enableGrouping &&
          (newSettings.problemsPerGroup <= 0 || newSettings.problemsPerGroup > 1000),
        error: 'errors.invalidProblemsPerGroup',
      },
      {
        condition:
          newSettings.enableGrouping &&
          (newSettings.totalGroups <= 0 || newSettings.totalGroups > 100),
        error: 'errors.invalidTotalGroups',
      },
      {
        condition: newSettings.numRange[0] > newSettings.numRange[1],
        error: 'errors.invalidNumberRange',
      },
      {
        condition: newSettings.resultRange[0] > newSettings.resultRange[1],
        error: 'errors.invalidResultRange',
      },
      {
        condition:
          newSettings.numOperandsRange[0] > newSettings.numOperandsRange[1] ||
          newSettings.numOperandsRange[0] < 2,
        error: 'errors.invalidOperandsRange',
      },
    ];

    const failedValidation = validations.find(validation => validation.condition);
    return failedValidation ? failedValidation.error : '';
  }, []);

  return { settings, setSettings, validateSettings };
};
