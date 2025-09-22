import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the PDF utility using factory function
vi.mock('@/utils/pdf', () => ({
  generatePdf: vi.fn().mockResolvedValue(undefined),
}));

import type { Problem, Settings } from '@/types';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useAppHandlers, useInitialGeneration, useQuizHandlers } from './useAppLogic';

describe('useAppLogic', () => {
  const mockSettings: Settings = {
    operations: ['+'],
    numProblems: 10,
    numRange: [1, 10],
    resultRange: [0, 20],
    numOperandsRange: [2, 3],
    allowNegative: false,
    showAnswers: false,
    fontSize: 16,
    lineSpacing: 12,
    paperSize: 'a4',
  };

  const mockProblems: Problem[] = [
    { id: 1, text: '2 + 3 = ?', correctAnswer: 5 },
    { id: 2, text: '4 + 5 = ?', correctAnswer: 9 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useInitialGeneration', () => {
    test('should generate problems when i18n is ready and not already generated', () => {
      const mockGenerateProblems = vi.fn(() => ({
        error: '',
        warning: '',
        successMessage: { key: 'success' },
      }));
      const mockValidateSettings = vi.fn(() => '');
      const mockSetHasInitialGenerated = vi.fn();
      const mockSetError = vi.fn();
      const mockSetWarning = vi.fn();
      const mockSetAndScheduleSuccess = vi.fn();

      renderHook(() =>
        useInitialGeneration({
          isI18nReady: true,
          settings: mockSettings,
          validateSettings: mockValidateSettings,
          generateProblems: mockGenerateProblems,
          hasInitialGenerated: false,
          setHasInitialGenerated: mockSetHasInitialGenerated,
          setError: mockSetError,
          setWarning: mockSetWarning,
          setAndScheduleSuccess: mockSetAndScheduleSuccess,
        })
      );

      expect(mockValidateSettings).toHaveBeenCalledWith(mockSettings);
      expect(mockGenerateProblems).toHaveBeenCalledWith(true);
      expect(mockSetHasInitialGenerated).toHaveBeenCalledWith(true);
      expect(mockSetAndScheduleSuccess).toHaveBeenCalledWith({ key: 'success' });
    });

    test('should not generate problems when i18n is not ready', () => {
      const mockGenerateProblems = vi.fn();
      const mockValidateSettings = vi.fn();
      const mockSetHasInitialGenerated = vi.fn();
      const mockSetError = vi.fn();
      const mockSetWarning = vi.fn();
      const mockSetAndScheduleSuccess = vi.fn();

      renderHook(() =>
        useInitialGeneration({
          isI18nReady: false,
          settings: mockSettings,
          validateSettings: mockValidateSettings,
          generateProblems: mockGenerateProblems,
          hasInitialGenerated: false,
          setHasInitialGenerated: mockSetHasInitialGenerated,
          setError: mockSetError,
          setWarning: mockSetWarning,
          setAndScheduleSuccess: mockSetAndScheduleSuccess,
        })
      );

      expect(mockGenerateProblems).not.toHaveBeenCalled();
    });

    test('should not generate problems when already generated', () => {
      const mockGenerateProblems = vi.fn();
      const mockValidateSettings = vi.fn();
      const mockSetHasInitialGenerated = vi.fn();
      const mockSetError = vi.fn();
      const mockSetWarning = vi.fn();
      const mockSetAndScheduleSuccess = vi.fn();

      renderHook(() =>
        useInitialGeneration({
          isI18nReady: true,
          settings: mockSettings,
          validateSettings: mockValidateSettings,
          generateProblems: mockGenerateProblems,
          hasInitialGenerated: true,
          setHasInitialGenerated: mockSetHasInitialGenerated,
          setError: mockSetError,
          setWarning: mockSetWarning,
          setAndScheduleSuccess: mockSetAndScheduleSuccess,
        })
      );

      expect(mockGenerateProblems).not.toHaveBeenCalled();
    });

    test('should set error when validation fails', () => {
      const mockGenerateProblems = vi.fn();
      const mockValidateSettings = vi.fn(() => 'validation.error');
      const mockSetHasInitialGenerated = vi.fn();
      const mockSetError = vi.fn();
      const mockSetWarning = vi.fn();
      const mockSetAndScheduleSuccess = vi.fn();

      renderHook(() =>
        useInitialGeneration({
          isI18nReady: true,
          settings: mockSettings,
          validateSettings: mockValidateSettings,
          generateProblems: mockGenerateProblems,
          hasInitialGenerated: false,
          setHasInitialGenerated: mockSetHasInitialGenerated,
          setError: mockSetError,
          setWarning: mockSetWarning,
          setAndScheduleSuccess: mockSetAndScheduleSuccess,
        })
      );

      expect(mockSetError).toHaveBeenCalledWith({ key: 'validation.error' });
      expect(mockGenerateProblems).not.toHaveBeenCalled();
    });
  });

  // usePdfDownload tests moved to src/hooks/usePdfDownload.test.ts for isolation and determinism

  describe('useQuizHandlers', () => {
    test('should start quiz mode when problems exist', async () => {
      const mockSetError = vi.fn();
      const mockSetIsQuizMode = vi.fn();
      const mockSetQuizResult = vi.fn();

      const { result } = renderHook(() =>
        useQuizHandlers(
          mockProblems,
          true, // isI18nReady
          mockSetError,
          mockSetIsQuizMode,
          mockSetQuizResult
        )
      );

      // Ensure the hook returns an object with the expected methods (wait for first render)
      await waitFor(() => expect(result.current).toBeTruthy());
      expect(typeof result.current.startQuizMode).toBe('function');
      expect(typeof result.current.exitQuizMode).toBe('function');

      act(() => {
        result.current.startQuizMode();
      });

      expect(mockSetIsQuizMode).toHaveBeenCalledWith(true);
      expect(mockSetQuizResult).toHaveBeenCalledWith(null);
    });

    test('should set error when no problems exist and i18n is ready', async () => {
      const mockSetError = vi.fn();
      const mockSetIsQuizMode = vi.fn();
      const mockSetQuizResult = vi.fn();

      const { result } = renderHook(() =>
        useQuizHandlers(
          [], // empty problems
          true, // isI18nReady
          mockSetError,
          mockSetIsQuizMode,
          mockSetQuizResult
        )
      );

      // Ensure the hook returns an object with the expected methods
      await waitFor(() => expect(result.current).toBeTruthy());
      expect(typeof result.current.startQuizMode).toBe('function');

      act(() => {
        result.current.startQuizMode();
      });

      expect(mockSetError).toHaveBeenCalledWith({ key: 'errors.noProblemsForQuiz' });
      expect(mockSetIsQuizMode).not.toHaveBeenCalled();
    });

    test('should not set error when no problems exist and i18n is not ready', async () => {
      const mockSetError = vi.fn();
      const mockSetIsQuizMode = vi.fn();
      const mockSetQuizResult = vi.fn();

      const { result } = renderHook(() =>
        useQuizHandlers(
          [], // empty problems
          false, // isI18nReady
          mockSetError,
          mockSetIsQuizMode,
          mockSetQuizResult
        )
      );

      // Ensure the hook returns an object with the expected methods
      await waitFor(() => expect(result.current).toBeTruthy());
      expect(typeof result.current.startQuizMode).toBe('function');

      act(() => {
        result.current.startQuizMode();
      });

      expect(mockSetError).not.toHaveBeenCalled();
      expect(mockSetIsQuizMode).not.toHaveBeenCalled();
    });

    test('should exit quiz mode', () => {
      const mockSetError = vi.fn();
      const mockSetIsQuizMode = vi.fn();
      const mockSetQuizResult = vi.fn();

      const { result } = renderHook(() =>
        useQuizHandlers(mockProblems, true, mockSetError, mockSetIsQuizMode, mockSetQuizResult)
      );

      act(() => {
        result.current.exitQuizMode();
      });

      expect(mockSetIsQuizMode).toHaveBeenCalledWith(false);
    });
  });

  describe('useAppHandlers', () => {
    test('should handle settings change', () => {
      const mockSetSettings = vi.fn();
      const mockClearMessages = vi.fn();
      const mockIsValidationSensitiveField = vi.fn(() => false);
      const mockValidateSettings = vi.fn();
      const mockCheckRestrictiveSettings = vi.fn(() => false);
      const mockSetError = vi.fn();
      const mockSetWarning = vi.fn();
      const mockSetSuccessMessage = vi.fn();

      const { result } = renderHook(() =>
        useAppHandlers({
          settings: mockSettings,
          setSettings: mockSetSettings,
          clearMessages: mockClearMessages,
          isValidationSensitiveField: mockIsValidationSensitiveField,
          validateSettings: mockValidateSettings,
          isLoading: false,
          checkRestrictiveSettings: mockCheckRestrictiveSettings,
          setError: mockSetError,
          setWarning: mockSetWarning,
          setSuccessMessage: mockSetSuccessMessage,
        })
      );

      act(() => {
        result.current.handleChange('numProblems', 20);
      });

      expect(mockClearMessages).toHaveBeenCalled();
      expect(mockSetSettings).toHaveBeenCalledWith({ ...mockSettings, numProblems: 20 });
    });

    test('should handle validation error on sensitive field change', () => {
      const mockSetSettings = vi.fn();
      const mockClearMessages = vi.fn();
      const mockIsValidationSensitiveField = vi.fn(() => true);
      const mockValidateSettings = vi.fn(() => 'validation.error');
      const mockCheckRestrictiveSettings = vi.fn(() => false);
      const mockSetError = vi.fn();
      const mockSetWarning = vi.fn();
      const mockSetSuccessMessage = vi.fn();

      const { result } = renderHook(() =>
        useAppHandlers({
          settings: mockSettings,
          setSettings: mockSetSettings,
          clearMessages: mockClearMessages,
          isValidationSensitiveField: mockIsValidationSensitiveField,
          validateSettings: mockValidateSettings,
          isLoading: false,
          checkRestrictiveSettings: mockCheckRestrictiveSettings,
          setError: mockSetError,
          setWarning: mockSetWarning,
          setSuccessMessage: mockSetSuccessMessage,
        })
      );

      act(() => {
        result.current.handleChange('numProblems', 20);
      });

      expect(mockSetError).toHaveBeenCalledWith({ key: 'validation.error' });
    });

    test('should skip validation when loading', () => {
      const mockSetSettings = vi.fn();
      const mockClearMessages = vi.fn();
      const mockIsValidationSensitiveField = vi.fn(() => true);
      const mockValidateSettings = vi.fn(() => 'validation.error');
      const mockCheckRestrictiveSettings = vi.fn(() => false);
      const mockSetError = vi.fn();
      const mockSetWarning = vi.fn();
      const mockSetSuccessMessage = vi.fn();

      const { result } = renderHook(() =>
        useAppHandlers({
          settings: mockSettings,
          setSettings: mockSetSettings,
          clearMessages: mockClearMessages,
          isValidationSensitiveField: mockIsValidationSensitiveField,
          validateSettings: mockValidateSettings,
          isLoading: true,
          checkRestrictiveSettings: mockCheckRestrictiveSettings,
          setError: mockSetError,
          setWarning: mockSetWarning,
          setSuccessMessage: mockSetSuccessMessage,
        })
      );

      act(() => {
        result.current.handleChange('numProblems', 20);
      });

      // Should not call validation functions when loading
      expect(mockSetError).not.toHaveBeenCalled();
      expect(mockSetWarning).not.toHaveBeenCalled();
      expect(mockSetSettings).toHaveBeenCalledWith({ ...mockSettings, numProblems: 20 });
    });

    test('should handle restrictive settings warning', () => {
      const mockSetSettings = vi.fn();
      const mockClearMessages = vi.fn();
      const mockIsValidationSensitiveField = vi.fn(() => true);
      const mockValidateSettings = vi.fn(() => '');
      const mockCheckRestrictiveSettings = vi.fn(() => true);
      const mockSetError = vi.fn();
      const mockSetWarning = vi.fn();
      const mockSetSuccessMessage = vi.fn();

      const { result } = renderHook(() =>
        useAppHandlers({
          settings: mockSettings,
          setSettings: mockSetSettings,
          clearMessages: mockClearMessages,
          isValidationSensitiveField: mockIsValidationSensitiveField,
          validateSettings: mockValidateSettings,
          isLoading: false,
          checkRestrictiveSettings: mockCheckRestrictiveSettings,
          setError: mockSetError,
          setWarning: mockSetWarning,
          setSuccessMessage: mockSetSuccessMessage,
        })
      );

      act(() => {
        result.current.handleChange('numProblems', 20);
      });

      expect(mockSetWarning).toHaveBeenCalledWith({ key: 'warnings.restrictiveSettings' });
    });

    test('should apply preset settings', () => {
      const mockSetSettings = vi.fn();
      const mockClearMessages = vi.fn();
      const mockIsValidationSensitiveField = vi.fn();
      const mockValidateSettings = vi.fn();
      const mockCheckRestrictiveSettings = vi.fn();
      const mockSetError = vi.fn();
      const mockSetWarning = vi.fn();
      const mockSetSuccessMessage = vi.fn();

      const { result } = renderHook(() =>
        useAppHandlers({
          settings: mockSettings,
          setSettings: mockSetSettings,
          clearMessages: mockClearMessages,
          isValidationSensitiveField: mockIsValidationSensitiveField,
          validateSettings: mockValidateSettings,
          isLoading: false,
          checkRestrictiveSettings: mockCheckRestrictiveSettings,
          setError: mockSetError,
          setWarning: mockSetWarning,
          setSuccessMessage: mockSetSuccessMessage,
        })
      );

      const presetSettings = { ...mockSettings, numProblems: 50 };

      act(() => {
        result.current.handleApplyPreset(presetSettings);
      });

      expect(mockSetSettings).toHaveBeenCalledWith(presetSettings);
      expect(mockClearMessages).toHaveBeenCalled();
      expect(mockSetSuccessMessage).toHaveBeenCalledWith({
        key: 'messages.info.presetApplied',
        params: { name: 'Preset' },
      });
    });

    test('should not show success message when loading', () => {
      const mockSetSettings = vi.fn();
      const mockClearMessages = vi.fn();
      const mockIsValidationSensitiveField = vi.fn();
      const mockValidateSettings = vi.fn();
      const mockCheckRestrictiveSettings = vi.fn();
      const mockSetError = vi.fn();
      const mockSetWarning = vi.fn();
      const mockSetSuccessMessage = vi.fn();

      const { result } = renderHook(() =>
        useAppHandlers({
          settings: mockSettings,
          setSettings: mockSetSettings,
          clearMessages: mockClearMessages,
          isValidationSensitiveField: mockIsValidationSensitiveField,
          validateSettings: mockValidateSettings,
          isLoading: true,
          checkRestrictiveSettings: mockCheckRestrictiveSettings,
          setError: mockSetError,
          setWarning: mockSetWarning,
          setSuccessMessage: mockSetSuccessMessage,
        })
      );

      const presetSettings = { ...mockSettings, numProblems: 50 };

      act(() => {
        result.current.handleApplyPreset(presetSettings);
      });

      expect(mockSetSuccessMessage).not.toHaveBeenCalled(); // Should not be called when loading
      expect(mockClearMessages).toHaveBeenCalled();
    });
  });
});
