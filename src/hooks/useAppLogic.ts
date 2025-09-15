import type { MessageValue, PaperSizeOptions, Problem, QuizResult, Settings } from '@/types';
import { generatePdf } from '@/utils/pdf';
import { useCallback, useEffect } from 'react';

export const useInitialGeneration = (
  isI18nReady: boolean,
  settings: Settings,
  validateSettings: (s: Settings) => string,
  generateProblems: (initial?: boolean) => {
    error: MessageValue;
    warning: MessageValue;
    successMessage: MessageValue;
  },
  hasInitialGenerated: boolean,
  setHasInitialGenerated: (v: boolean) => void,
  setError: (v: MessageValue) => void,
  setWarning: (v: MessageValue) => void,
  setAndScheduleSuccess: (v: MessageValue) => void
): void => {
  useEffect(() => {
    if (!isI18nReady || hasInitialGenerated) {
      return;
    }

    const validationError = validateSettings(settings);
    if (!validationError) {
      const messages = generateProblems(true);
      setError(messages.error);
      setWarning(messages.warning);
      setAndScheduleSuccess(messages.successMessage);
      setHasInitialGenerated(true);
    } else {
      setError({ key: validationError });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isI18nReady,
    hasInitialGenerated,
    // Removed settings, validateSettings, generateProblems from dependencies
    // to prevent continuous regeneration on settings changes
    setHasInitialGenerated,
    setError,
    setWarning,
    setAndScheduleSuccess,
  ]);
};

export const usePdfDownload = (
  problems: Problem[],
  settings: Settings,
  paperSizeOptions: PaperSizeOptions,
  showSuccessMessage: (msg: MessageValue) => void,
  setError: (msg: MessageValue) => void,
  clearMessages: () => void,
  isDev: boolean
) => {
  return useCallback(async (): Promise<void> => {
    if (!problems.length) {
      const msg = { key: 'errors.noProblemsToPdf' } as const;
      setError(msg);
      return;
    }
    clearMessages();
    try {
      await generatePdf(problems, settings, paperSizeOptions);
      showSuccessMessage({ key: 'messages.success.pdfGenerated' });
    } catch (err) {
      const msg = { key: 'errors.pdfFailed' } as const;
      setError(msg);
      if (isDev) {
        console.error('PDF generation error:', err);
      }
    }
  }, [problems, settings, paperSizeOptions, showSuccessMessage, setError, clearMessages, isDev]);
};

export const useQuizHandlers = (
  problems: Problem[],
  isI18nReady: boolean,
  setError: (msg: MessageValue) => void,
  setIsQuizMode: (v: boolean) => void,
  setQuizResult: (v: QuizResult | null) => void
) => {
  const startQuizMode = useCallback((): void => {
    if (problems.length === 0) {
      if (isI18nReady) {
        setError({ key: 'errors.noProblemsForQuiz' });
      }
      return;
    }
    setIsQuizMode(true);
    setQuizResult(null);
  }, [problems.length, isI18nReady, setError, setIsQuizMode, setQuizResult]);

  const exitQuizMode = useCallback((): void => {
    setIsQuizMode(false);
  }, [setIsQuizMode]);

  return { startQuizMode, exitQuizMode };
};

export const useAppHandlers = (
  settings: Settings,
  setSettings: (s: Settings) => void,
  clearMessages: () => void,
  isValidationSensitiveField: (field: keyof Settings) => boolean,
  validateSettings: (s: Settings) => string,
  isLoading: boolean,
  checkRestrictiveSettings: (s: Settings) => boolean,
  setError: (msg: MessageValue) => void,
  setWarning: (msg: MessageValue) => void,
  setSuccessMessage: (msg: MessageValue) => void
) => {
  const handleChange = useCallback(
    <K extends keyof Settings>(field: K, value: Settings[K]): void => {
      const newSettings = { ...settings, [field]: value };
      clearMessages();
      if (isValidationSensitiveField(field)) {
        const validationError = validateSettings(newSettings);
        if (validationError && !isLoading) {
          setError({ key: validationError });
        } else if (checkRestrictiveSettings(newSettings) && !isLoading) {
          setWarning({ key: 'warnings.restrictiveSettings' });
        }
      }
      setSettings(newSettings);
    },
    [
      settings,
      clearMessages,
      isValidationSensitiveField,
      validateSettings,
      isLoading,
      checkRestrictiveSettings,
      setError,
      setWarning,
      setSettings,
    ]
  );

  const handleApplyPreset = useCallback(
    (presetSettings: Settings): void => {
      setSettings(presetSettings);
      setError('');
      setWarning('');
      if (!isLoading) {
        setSuccessMessage({ key: 'messages.info.presetApplied', params: { name: 'Preset' } });
      } else {
        setSuccessMessage('');
      }
    },
    [setSettings, setError, setWarning, setSuccessMessage, isLoading]
  );

  return { handleChange, handleApplyPreset } as const;
};
