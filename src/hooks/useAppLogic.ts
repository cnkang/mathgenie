import type { MessageValue, PaperSizeOptions, Problem, QuizResult, Settings } from '@/types';
import { generatePdf } from '@/utils/pdf';
import { useCallback, useEffect } from 'react';

type UseInitialGenerationArgs = {
  isI18nReady: boolean;
  settings: Settings;
  validateSettings: (s: Settings) => string;
  generateProblems: (initial?: boolean) => {
    error: MessageValue;
    warning: MessageValue;
    successMessage: MessageValue;
  };
  hasInitialGenerated: boolean;
  setHasInitialGenerated: (v: boolean) => void;
  setError: (v: MessageValue) => void;
  setWarning: (v: MessageValue) => void;
  setAndScheduleSuccess: (v: MessageValue) => void;
};

export const useInitialGeneration = ({
  isI18nReady,
  settings,
  validateSettings,
  generateProblems,
  hasInitialGenerated,
  setHasInitialGenerated,
  setError,
  setWarning,
  setAndScheduleSuccess,
}: UseInitialGenerationArgs): void => {
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
  const handlePdfError = useCallback(
    (err: unknown) => {
      const pdfFailedMessage = { key: 'errors.pdfFailed' } as const;
      setError(pdfFailedMessage);
      if (isDev) {
        console.error('PDF generation error:', JSON.stringify(err));
      }
    },
    [setError, isDev]
  );

  return useCallback(async (): Promise<void> => {
    const emptyProblemsMessage = { key: 'errors.noProblemsToPdf' } as const;
    const pdfGeneratedMessage = { key: 'messages.success.pdfGenerated' } as const;

    if (problems.length === 0) {
      setError(emptyProblemsMessage);
      return;
    }

    clearMessages();

    try {
      await generatePdf(problems, settings, paperSizeOptions);
      showSuccessMessage(pdfGeneratedMessage);
    } catch (err) {
      handlePdfError(err);
    }
  }, [
    problems,
    settings,
    paperSizeOptions,
    showSuccessMessage,
    setError,
    clearMessages,
    handlePdfError,
  ]);
};

const startQuizModeLogic = (
  hasProblems: boolean,
  isI18nReady: boolean,
  setError: (msg: MessageValue) => void,
  setIsQuizMode: (v: boolean) => void,
  setQuizResult: (v: QuizResult | null) => void
): void => {
  if (hasProblems) {
    setIsQuizMode(true);
    setQuizResult(null);
    return;
  }

  if (isI18nReady) {
    setError({ key: 'errors.noProblemsForQuiz' });
  }
};

export const useQuizHandlers = (
  problems: Problem[],
  isI18nReady: boolean,
  setError: (msg: MessageValue) => void,
  setIsQuizMode: (v: boolean) => void,
  setQuizResult: (v: QuizResult | null) => void
) => {
  const startQuizMode = useCallback((): void => {
    const hasProblems = problems.length > 0;
    startQuizModeLogic(hasProblems, isI18nReady, setError, setIsQuizMode, setQuizResult);
  }, [problems.length, isI18nReady, setError, setIsQuizMode, setQuizResult]);

  const exitQuizMode = useCallback((): void => {
    setIsQuizMode(false);
  }, [setIsQuizMode]);

  return { startQuizMode, exitQuizMode };
};

/**
 * Hook for providing validation feedback to users.
 * Handles both validation errors and restrictive settings warnings.
 *
 * @param validateSettings - Function to validate settings and return error key
 * @param checkRestrictiveSettings - Function to check if settings are too restrictive
 * @param setError - Function to set error messages
 * @param setWarning - Function to set warning messages
 * @returns Callback function to provide validation feedback for pending settings
 */
const useValidationFeedback = (
  validateSettings: (s: Settings) => string,
  checkRestrictiveSettings: (s: Settings) => boolean,
  setError: (msg: MessageValue) => void,
  setWarning: (msg: MessageValue) => void
) => {
  const handleValidationError = useCallback(
    (validationError: string) => {
      setError({ key: validationError });
    },
    [setError]
  );

  const handleRestrictiveWarning = useCallback(() => {
    setWarning({ key: 'warnings.restrictiveSettings' });
  }, [setWarning]);

  return useCallback(
    (pendingSettings: Settings): void => {
      const validationError = validateSettings(pendingSettings);

      if (validationError) {
        handleValidationError(validationError);
        return;
      }

      if (checkRestrictiveSettings(pendingSettings)) {
        handleRestrictiveWarning();
      }
    },
    [validateSettings, checkRestrictiveSettings, handleValidationError, handleRestrictiveWarning]
  );
};

/**
 * Hook for determining whether a field should be validated.
 * Prevents validation during loading states and checks field sensitivity.
 *
 * @param isLoading - Whether the application is in a loading state
 * @param isValidationSensitiveField - Function to check if a field requires validation
 * @returns Function that determines if a field should be validated
 */
const useFieldValidation = (
  isLoading: boolean,
  isValidationSensitiveField: (field: keyof Settings) => boolean
) => {
  return useCallback(
    (field: keyof Settings): boolean => {
      return !isLoading && isValidationSensitiveField(field);
    },
    [isLoading, isValidationSensitiveField]
  );
};

const useSettingsChangeHandler = (
  settings: Settings,
  setSettings: (s: Settings) => void,
  clearMessages: () => void,
  shouldValidateField: (field: keyof Settings) => boolean,
  provideValidationFeedback: (settings: Settings) => void
) => {
  return useCallback(
    <K extends keyof Settings>(field: K, value: Settings[K]): void => {
      const newSettings = { ...settings, [field]: value };
      clearMessages();

      if (shouldValidateField(field)) {
        provideValidationFeedback(newSettings);
      }

      setSettings(newSettings);
    },
    [settings, clearMessages, shouldValidateField, provideValidationFeedback, setSettings]
  );
};

const applyPresetSettings = (
  presetSettings: Settings,
  setSettings: (s: Settings) => void,
  clearMessages: () => void,
  isLoading: boolean,
  setSuccessMessage: (msg: MessageValue) => void
): void => {
  setSettings(presetSettings);
  clearMessages();

  if (isLoading) {
    return;
  }

  setSuccessMessage({ key: 'messages.info.presetApplied', params: { name: 'Preset' } });
};

const usePresetHandler = (
  setSettings: (s: Settings) => void,
  clearMessages: () => void,
  isLoading: boolean,
  setSuccessMessage: (msg: MessageValue) => void
) => {
  return useCallback(
    (presetSettings: Settings): void => {
      applyPresetSettings(presetSettings, setSettings, clearMessages, isLoading, setSuccessMessage);
    },
    [setSettings, clearMessages, isLoading, setSuccessMessage]
  );
};

type UseAppHandlersArgs = {
  settings: Settings;
  setSettings: (s: Settings) => void;
  clearMessages: () => void;
  isValidationSensitiveField: (field: keyof Settings) => boolean;
  validateSettings: (s: Settings) => string;
  isLoading: boolean;
  checkRestrictiveSettings: (s: Settings) => boolean;
  setError: (msg: MessageValue) => void;
  setWarning: (msg: MessageValue) => void;
  setSuccessMessage: (msg: MessageValue) => void;
};

export const useAppHandlers = ({
  settings,
  setSettings,
  clearMessages,
  isValidationSensitiveField,
  validateSettings,
  isLoading,
  checkRestrictiveSettings,
  setError,
  setWarning,
  setSuccessMessage,
}: UseAppHandlersArgs) => {
  const provideValidationFeedback = useValidationFeedback(
    validateSettings,
    checkRestrictiveSettings,
    setError,
    setWarning
  );

  const shouldValidateField = useFieldValidation(isLoading, isValidationSensitiveField);

  const handleChange = useSettingsChangeHandler(
    settings,
    setSettings,
    clearMessages,
    shouldValidateField,
    provideValidationFeedback
  );

  const handleApplyPreset = usePresetHandler(
    setSettings,
    clearMessages,
    isLoading,
    setSuccessMessage
  );

  return { handleChange, handleApplyPreset } as const;
};
