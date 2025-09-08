import { useEffect, useState } from 'react';
import type { MessageValue, Settings } from '@/types';

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
};

const loadSettings = (): Settings => {
  try {
    const saved = localStorage.getItem('mathgenie-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...defaultSettings,
        ...parsed,
        operations: Array.isArray(parsed.operations)
          ? parsed.operations
          : defaultSettings.operations,
        numRange:
          Array.isArray(parsed.numRange) && parsed.numRange.length === 2
            ? parsed.numRange
            : defaultSettings.numRange,
        resultRange:
          Array.isArray(parsed.resultRange) && parsed.resultRange.length === 2
            ? parsed.resultRange
            : defaultSettings.resultRange,
        numOperandsRange:
          Array.isArray(parsed.numOperandsRange) && parsed.numOperandsRange.length === 2
            ? parsed.numOperandsRange
            : defaultSettings.numOperandsRange,
      };
    }
  } catch (error) {
    localStorage.removeItem('mathgenie-settings');
    if (import.meta.env.DEV) {
      console.warn('Failed to load settings from localStorage:', error);
    }
  }
  return defaultSettings;
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());

  useEffect(() => {
    try {
      localStorage.setItem('mathgenie-settings', JSON.stringify(settings));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to save settings to localStorage:', error);
      }
    }
  }, [settings]);

  const validateSettings = (newSettings: Settings): MessageValue => {
    if (newSettings.operations.length === 0) {
      return { key: 'errors.noOperations' };
    }
    if (newSettings.numProblems <= 0 || newSettings.numProblems > 100) {
      return { key: 'errors.invalidProblemCount' };
    }
    if (newSettings.numRange[0] > newSettings.numRange[1]) {
      return { key: 'errors.invalidNumberRange' };
    }
    if (newSettings.resultRange[0] > newSettings.resultRange[1]) {
      return { key: 'errors.invalidResultRange' };
    }
    if (
      newSettings.numOperandsRange[0] > newSettings.numOperandsRange[1] ||
      newSettings.numOperandsRange[0] < 2
    ) {
      return { key: 'errors.invalidOperandsRange' };
    }
    return '';
  };

  return { settings, setSettings, validateSettings };
};
