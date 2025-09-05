import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import type { I18nContextType, Language, Translations } from '../types';

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

const getBrowserLanguage = (): string => {
  if (typeof navigator === 'undefined') {
    return 'en';
  }

  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  const langCode = browserLang.split('-')[0];
  return languages[langCode] ? langCode : 'en';
};

// Fallback text for common keys when translations are not loaded yet
const getFallbackText = (key: string): string | null => {
  const fallbacks: Record<string, string> = {
    'app.title': 'MathGenie',
    'app.subtitle': 'Generate customized math problems for practice and learning',
    'loading.translations': 'Loading translations...',
    'loading.insights': 'Loading insights...',
    'buttons.generate': 'Generate Problems',
    'buttons.generateDescription': 'Create new math problems with your current settings',
    'buttons.download': 'Download PDF',
    'buttons.downloadDescription': 'Save your problems as a printable PDF file',
    'buttons.quizDescription': 'Test your skills with an interactive quiz',
    'buttons.downloadEmpty': 'Download PDF',
    'results.title': 'Generated Problems',
    'results.noProblems': 'No problems generated yet',
    'operations.title': 'Select Operations',
    'settings.numProblems': 'Number of Problems',
    'settings.numberRange': 'Number Range',
    'settings.resultRange': 'Result Range',
    'settings.operandsRange': 'Number of Operands',
    'settings.allowNegative': 'Allow Negative Results',
    'settings.showAnswers': 'Show Answers',
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
    'settings.manager.title': 'Settings Manager',
    'settings.export': 'Export Settings',
    'settings.import': 'Import Settings',
    'settings.importError': 'Error importing settings file',
    'settings.manager.export': 'Export Settings',
    'settings.manager.import': 'Import Settings',
    'language.select': 'Language',
    'errors.noOperations': 'Please select at least one operation.',
    'errors.invalidProblemCount': 'Number of problems must be between 1 and 100.',
    'errors.invalidNumberRange': 'Number range minimum cannot be greater than maximum.',
    'errors.invalidResultRange': 'Result range minimum cannot be greater than maximum.',
    'errors.invalidOperandsRange':
      'Invalid operands range: minimum must be at least 2 and not greater than maximum.',
    'errors.noProblemsGenerated':
      'No problems could be generated with current settings. Try adjusting the ranges.',
    'errors.generationFailed': 'Failed to generate problems. Please try again.',
    'errors.noProblemsToPdf': 'No problems to download. Generate problems first.',
    'errors.pdfFailed': 'Failed to generate PDF. Please try again.',
    'messages.success.problemsGenerated': 'Successfully generated {{count}} problems!',
    'messages.success.settingsImported': 'Settings imported successfully!',
    'messages.success.settingsExported': 'Settings exported successfully!',
    'messages.success.pdfGenerated': 'PDF downloaded successfully!',
  };

  return fallbacks[key] || null;
};

const loadTranslations = async (language: string): Promise<Translations> => {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (__DEV__) {
        console.log(`🌐 Loading translations for "${language}" (attempt ${attempt})`);
      }

      const translations = await import(`./translations/${language}.ts`);

      if (__DEV__) {
        console.log(`🌐 Successfully loaded translations for "${language}"`);
      }

      return translations.default;
    } catch (error) {
      lastError = error as Error;

      if (__DEV__) {
        console.warn(`🌐 Attempt ${attempt} failed to load translations for "${language}":`, error);
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
  }

  // All retries failed, fall back to English
  if (__DEV__) {
    console.error(
      `🌐 All attempts failed to load translations for "${language}", falling back to English. Last error:`,
      lastError
    );
  }

  try {
    const fallback = await import('./translations/en');
    return fallback.default;
  } catch (fallbackError) {
    if (__DEV__) {
      console.error('🌐 Failed to load fallback English translations:', fallbackError);
    }
    // Return empty translations as last resort
    return {};
  }
};

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    // 优先使用用户保存的语言设置，只有在没有保存设置时才使用浏览器语言
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedLanguage = localStorage.getItem('mathgenie-language');
      return savedLanguage || getBrowserLanguage();
    }
    return getBrowserLanguage();
  });
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;

    const loadLanguage = async (): Promise<void> => {
      if (!isMounted) return;

      setIsLoading(true);
      try {
        const newTranslations = await loadTranslations(currentLanguage);
        if (!isMounted) return;

        setTranslations(newTranslations);

        // Safe localStorage access
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('mathgenie-language', currentLanguage);
        }

        // Safe document access
        if (typeof document !== 'undefined' && document.documentElement) {
          document.documentElement.lang = currentLanguage;
        }
      } catch (error) {
        if (__DEV__) {
          console.error('🌐 Failed to load translations:', error);
        }
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

  const t = (key: string, params: Record<string, string | number> = {}): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        break;
      }
    }

    if (value === undefined) {
      // Only show warning in development mode
      if (__DEV__) {
        console.warn(`🌐 Translation missing for key: ${key}`);
      }

      // Return a more user-friendly fallback
      const fallbackText = getFallbackText(key);
      value = fallbackText || key;
    }

    // Apply parameter substitution to both translations and fallback text
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      let result = value;
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        const placeholder = '{{' + paramKey + '}}';
        while (result.includes(placeholder)) {
          result = result.replace(placeholder, String(paramValue));
        }
      });
      return result;
    }

    return String(value);
  };

  const changeLanguage = (newLanguage: string): void => {
    if (languages[newLanguage]) {
      startTransition(() => {
        setCurrentLanguage(newLanguage);
      });
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
    [currentLanguage, translations, isLoading, isPending]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export default I18nProvider;
