import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import type { I18nContextType, Language, Translations } from '../types';

// Do not edit manually.
const STR_UNDEFINED = 'undefined' as const;

const languages: Record<string, Language> = {
  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
  },
  zh: {
    code: 'zh',
    name: '中文',
    flag: '🇨🇳',
  },
  es: {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
  },
  fr: {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
  },
  de: {
    code: 'de',
    name: 'Deutsch',
    flag: '🇩🇪',
  },
  ja: {
    code: 'ja',
    name: '日本語',
    flag: '🇯🇵',
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};

// Safe translation function that can be used during initial render
const { DEV } = import.meta.env;
const devLog: (...args: unknown[]) => void = DEV ? (...args) => console.log(...args) : () => {};
const devWarn: (...args: unknown[]) => void = DEV ? (...args) => console.warn(...args) : () => {};
const devError: (...args: unknown[]) => void = DEV ? (...args) => console.error(...args) : () => {};

const safeT = (key: string, params: Record<string, string | number> = {}): string => {
  const fallbackText = getFallbackText(key);
  if (fallbackText) {
    return interpolate(fallbackText, params);
  }
  return key;
};

const getValueByKeyPath = (translations: Translations, key: string): unknown => {
  const keys = key.split('.');
  let value: unknown = translations;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }
  return value;
};

const hasNoParams = (params: Record<string, string | number>): boolean => {
  return Object.keys(params).length === 0;
};

const replaceAllPlaceholders = (text: string, key: string, value: string | number): string => {
  const placeholder = '{{' + key + '}}';
  let result = text;
  while (result.includes(placeholder)) {
    result = result.replace(placeholder, String(value));
  }
  return result;
};

export const interpolate = (template: string, params: Record<string, string | number>): string => {
  if (hasNoParams(params)) {
    return template;
  }

  let result = template;
  for (const [paramKey, paramValue] of Object.entries(params)) {
    result = replaceAllPlaceholders(result, paramKey, paramValue);
  }
  return result;
};

const getBrowserLanguage = (): string => {
  if (typeof navigator === STR_UNDEFINED) {
    return 'en';
  }

  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  const langCode = browserLang.split('-')[0];
  return languages[langCode] ? langCode : 'en';
};

const createAppFallbacks = (): Record<string, string> => ({
  'app.title': 'MathGenie',
  'app.subtitle': 'Generate customized math problems for practice and learning',
  'loading.translations': 'Loading translations...',
  'loading.insights': 'Loading insights...',
});

const createButtonFallbacks = (): Record<string, string> => ({
  'buttons.generate': 'Generate Problems',
  'buttons.generateDescription': 'Create new math problems with your current settings',
  'buttons.download': 'Download PDF',
  'buttons.downloadDescription': 'Save your problems as a printable PDF file',
  'buttons.quizDescription': 'Test your skills with an interactive quiz',
  'buttons.downloadEmpty': 'Download PDF',
});

const createSettingsFallbacks = (): Record<string, string> => ({
  'settings.numProblems': 'Number of Problems',
  'settings.numberRange': 'Number Range',
  'settings.resultRange': 'Result Range',
  'settings.operandsRange': 'Number of Operands',
  'settings.allowNegative': 'Allow Negative Results',
  'settings.showAnswers': 'Show Answers',
  'settings.manager.title': 'Settings Manager',
  'settings.manager.export': 'Export Settings',
  'settings.manager.import': 'Import Settings',
  'settings.importError': 'Error importing settings file',
});

const createErrorFallbacks = (): Record<string, string> => ({
  'errors.noOperations': 'Please select at least one operation.',
  'errors.invalidProblemCount': 'Number of problems must be between 1 and 50,000.',
  'errors.invalidTotalProblemCount': 'Total number of problems cannot exceed 50,000.',
  'errors.invalidProblemsPerGroup': 'Problems per group must be between 1 and 1,000.',
  'errors.invalidTotalGroups': 'Total groups must be between 1 and 100.',
  'errors.invalidNumberRange': 'Number range minimum cannot be greater than maximum.',
  'errors.invalidResultRange': 'Result range minimum cannot be greater than maximum.',
  'errors.invalidOperandsRange':
    'Invalid operands range: minimum must be at least 2 and not greater than maximum.',
  'errors.noProblemsGenerated':
    'No problems could be generated with current settings. Try adjusting the ranges.',
  'errors.generationFailed': 'Failed to generate problems. Please try again.',
  'errors.noProblemsToPdf': 'No problems to download. Generate problems first.',
  'errors.pdfFailed': 'Failed to generate PDF. Please try again.',
});

const createMessageFallbacks = (): Record<string, string> => ({
  'messages.success.problemsGenerated': 'Successfully generated {{count}} problems!',
  'messages.success.settingsImported': 'Settings imported successfully!',
  'messages.success.settingsExported': 'Settings exported successfully!',
  'messages.success.pdfGenerated': 'PDF downloaded successfully!',
});

const createOtherFallbacks = (): Record<string, string> => ({
  'results.title': 'Generated Problems',
  'results.noProblems': 'No problems generated yet',
  'operations.title': 'Select Operations',
  'pdf.title': 'PDF Settings',
  'pdf.fontSize': 'Font Size (pt)',
  'pdf.lineSpacing': 'Line Spacing (pt)',
  'pdf.paperSize': 'Paper Size',
  'presets.title': 'Quick Presets',
  'presets.apply': 'Apply',
  'presets.clickToApply': 'Click to apply',
  'presets.beginner.name': 'Beginner (1-10)',
  'presets.beginner.description': 'Simple addition and subtraction',
  'presets.intermediate.name': 'Intermediate (1-50)',
  'presets.intermediate.description': 'All operations with medium numbers',
  'presets.advanced.name': 'Advanced (1-100)',
  'presets.advanced.description': 'All operations including division',
  'presets.multiplication.name': 'Multiplication Focus',
  'presets.multiplication.description': 'Focus on multiplication tables',
  'language.select': 'Language',
});

// Fallback text for common keys when translations are not loaded yet
const getFallbackText = (key: string): string | null => {
  const fallbacks = {
    ...createAppFallbacks(),
    ...createButtonFallbacks(),
    ...createSettingsFallbacks(),
    ...createErrorFallbacks(),
    ...createMessageFallbacks(),
    ...createOtherFallbacks(),
  };

  return fallbacks[key] || null;
};

const loadTranslationFile = async (language: string): Promise<Translations> => {
  // The language code is assumed to be validated before this function is called.
  const translations = await import(`./translations/${language}.ts`);
  return translations.default;
};

const waitForRetry = async (attempt: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
};

const loadFallbackTranslations = async (): Promise<Translations> => {
  try {
    const fallback = await import('./translations/en');
    return fallback.default;
  } catch (fallbackError) {
    devError('🌐 Failed to load fallback English translations:', fallbackError);
    return {};
  }
};

const persistLanguageSelection = (language: string): void => {
  if (typeof window === STR_UNDEFINED || !window.localStorage) {
    return;
  }
  window.localStorage.setItem('mathgenie-language', language);
};

const setDocumentLanguage = (language: string): void => {
  if (typeof document === STR_UNDEFINED || !document.documentElement) {
    return;
  }
  document.documentElement.lang = language;
};

const performLoadAttempt = async (
  attempt: number,
  action: () => Promise<Translations>,
  describe: (attempt: number) => void,
  onSuccess: () => void
): Promise<{ success: true; data: Translations } | { success: false; error: Error }> => {
  try {
    describe(attempt);
    const result = await action();
    onSuccess();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error as Error };
  }
};

const loadWithRetry = async (
  action: () => Promise<Translations>,
  describe: (attempt: number) => void,
  onSuccess: () => void,
  onAttemptFail: (attempt: number, error: unknown) => void,
  maxRetries = 3
): Promise<Translations> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const outcome = await performLoadAttempt(attempt, action, describe, onSuccess);
    if (outcome.success) {
      return outcome.data;
    }

    lastError = outcome.error;
    onAttemptFail(attempt, outcome.error);

    if (attempt < maxRetries) {
      await waitForRetry(attempt);
    }
  }

  devError('🌐 All attempts failed. Last error:', lastError);
  return loadFallbackTranslations();
};

const loadTranslations = async (language: string): Promise<Translations> => {
  if (!/^[a-z]{2}$/.test(language) || !languages[language]) {
    devError(`Invalid or unsupported language code: "${language}". Falling back to English.`);
    return loadFallbackTranslations();
  }

  return loadWithRetry(
    () => loadTranslationFile(language),
    attempt => devLog(`🌐 Loading translations for "${language}" (attempt ${attempt})`),
    () => devLog(`🌐 Successfully loaded translations for "${language}"`),
    (attempt, error) =>
      devWarn(`🌐 Attempt ${attempt} failed to load translations for "${language}":`, error)
  );
};

const useLanguageState = (
  currentLanguage: string
): { translations: Translations; isLoading: boolean; isInitialized: boolean } => {
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadLanguage = async (): Promise<void> => {
      try {
        const newTranslations = await loadTranslations(currentLanguage);
        if (!isMounted) {
          return;
        }
        setTranslations(newTranslations);
        setIsInitialized(true);
        persistLanguageSelection(currentLanguage);
        setDocumentLanguage(currentLanguage);
      } catch (error) {
        devError('🌐 Failed to load translations:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadLanguage();
    return () => {
      isMounted = false;
    };
  }, [currentLanguage]);

  return { translations, isLoading, isInitialized };
};

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    // 优先使用用户保存的语言设置，只有在没有保存设置时才使用浏览器语言
    if (typeof window !== STR_UNDEFINED && window.localStorage) {
      const savedLanguage = localStorage.getItem('mathgenie-language');
      return savedLanguage || getBrowserLanguage();
    }
    return getBrowserLanguage();
  });
  const { translations, isLoading, isInitialized } = useLanguageState(currentLanguage);
  const [isPending, startTransition] = useTransition();

  const t = useCallback(
    (key: string, params: Record<string, string | number> = {}): string => {
      if (!isInitialized || isLoading || Object.keys(translations).length === 0) {
        return safeT(key, params);
      }
      const value = getValueByKeyPath(translations, key);
      if (typeof value === 'string') {
        return interpolate(value, params);
      }
      return safeT(key, params);
    },
    [isInitialized, isLoading, translations]
  );

  const changeLanguage = (newLanguage: string): void => {
    if (languages[newLanguage]) {
      startTransition(() => {
        setCurrentLanguage(newLanguage);
      });
    } else {
      devWarn(`Attempted to change to an unsupported language: "${newLanguage}"`);
    }
  };

  const value = useMemo(
    (): I18nContextType => ({
      currentLanguage,
      languages,
      translations,
      isLoading: isLoading || isPending,
      t,
      changeLanguage,
    }),
    [currentLanguage, translations, isLoading, isPending, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export default I18nProvider;
