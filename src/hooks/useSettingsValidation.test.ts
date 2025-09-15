import { describe, expect, it } from 'vitest';
import type { Settings } from '../types';
import { useSettingsValidation } from './useSettingsValidation';

describe('useSettingsValidation', () => {
  const mockSettings: Settings = {
    operations: ['+', '-'],
    numRange: [1, 10],
    resultRange: [0, 20],
    numProblems: 5,
    numOperandsRange: [2, 2],
    allowNegative: false,
    showAnswers: true,
    fontSize: 12,
    lineSpacing: 1.5,
    paperSize: 'a4',
  };

  it('should identify validation sensitive fields correctly', () => {
    const { isValidationSensitiveField } = useSettingsValidation();

    // Validation sensitive fields
    expect(isValidationSensitiveField('numProblems')).toBe(true);
    expect(isValidationSensitiveField('numRange')).toBe(true);
    expect(isValidationSensitiveField('resultRange')).toBe(true);
    expect(isValidationSensitiveField('numOperandsRange')).toBe(true);
    expect(isValidationSensitiveField('operations')).toBe(true);

    // Non-validation sensitive fields
    expect(isValidationSensitiveField('allowNegative')).toBe(false);
    expect(isValidationSensitiveField('showAnswers')).toBe(false);
    expect(isValidationSensitiveField('fontSize')).toBe(false);
    expect(isValidationSensitiveField('lineSpacing')).toBe(false);
    expect(isValidationSensitiveField('paperSize')).toBe(false);
  });

  it('should detect restrictive settings with small ranges and many problems', () => {
    const { checkRestrictiveSettings } = useSettingsValidation();

    // Restrictive settings: small result range (< 10) and many problems (> 20)
    const restrictiveSettings: Settings = {
      ...mockSettings,
      resultRange: [0, 5], // Range size = 5 (< 10)
      numProblems: 25, // > 20
    };

    expect(checkRestrictiveSettings(restrictiveSettings)).toBe(true);
  });

  it('should detect restrictive settings with small num range and many problems', () => {
    const { checkRestrictiveSettings } = useSettingsValidation();

    // Restrictive settings: small num range (< 5) and many problems (> 20)
    const restrictiveSettings: Settings = {
      ...mockSettings,
      numRange: [1, 3], // Range size = 2 (< 5)
      numProblems: 25, // > 20
    };

    expect(checkRestrictiveSettings(restrictiveSettings)).toBe(true);
  });

  it('should not detect restrictive settings with large ranges', () => {
    const { checkRestrictiveSettings } = useSettingsValidation();

    // Non-restrictive settings: large ranges
    const nonRestrictiveSettings: Settings = {
      ...mockSettings,
      resultRange: [0, 50], // Range size = 50 (>= 10)
      numRange: [1, 20], // Range size = 19 (>= 5)
      numProblems: 25, // > 20
    };

    expect(checkRestrictiveSettings(nonRestrictiveSettings)).toBe(false);
  });

  it('should not detect restrictive settings with few problems', () => {
    const { checkRestrictiveSettings } = useSettingsValidation();

    // Non-restrictive settings: few problems
    const nonRestrictiveSettings: Settings = {
      ...mockSettings,
      resultRange: [0, 5], // Range size = 5 (< 10)
      numRange: [1, 3], // Range size = 2 (< 5)
      numProblems: 10, // <= 20
    };

    expect(checkRestrictiveSettings(nonRestrictiveSettings)).toBe(false);
  });

  it('should handle edge cases for range sizes', () => {
    const { checkRestrictiveSettings } = useSettingsValidation();

    // Edge case: exactly at the threshold
    const edgeCaseSettings: Settings = {
      ...mockSettings,
      resultRange: [0, 10], // Range size = 10 (exactly at threshold)
      numRange: [1, 6], // Range size = 5 (exactly at threshold)
      numProblems: 21, // Just above threshold
    };

    expect(checkRestrictiveSettings(edgeCaseSettings)).toBe(false);
  });

  it('should handle negative ranges correctly', () => {
    const { checkRestrictiveSettings } = useSettingsValidation();

    // Settings with negative ranges
    const negativeRangeSettings: Settings = {
      ...mockSettings,
      resultRange: [-5, 5], // Range size = 10 (>= 10)
      numRange: [-2, 3], // Range size = 5 (>= 5)
      numProblems: 25, // > 20
    };

    expect(checkRestrictiveSettings(negativeRangeSettings)).toBe(false);
  });
});
