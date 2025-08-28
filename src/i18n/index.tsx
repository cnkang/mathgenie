import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useTransition,
  ReactNode,
} from 'react';
import type { Language, Translations, I18nContextType } from '../types';

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
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  const langCode = browserLang.split('-')[0];
  return languages[langCode] ? langCode : 'en';
};

const loadTranslations = async (language: string): Promise<Translations> => {
  try {
    const translations = await import(`./translations/${language}.js`);
    return translations.default;
  } catch (error) {
    console.warn(`Failed to load translations for ${language}, falling back to English`);
    const fallback = await import('./translations/en.js');
    return fallback.default;
  }
};

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    return localStorage.getItem('mathgenie-language') || getBrowserLanguage();
  });
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const loadLanguage = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const newTranslations = await loadTranslations(currentLanguage);
        setTranslations(newTranslations);
        localStorage.setItem('mathgenie-language', currentLanguage);
        document.documentElement.lang = currentLanguage;
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, [currentLanguage]);

  const t = (key: string, params: Record<string, string | number> = {}): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    if (value === undefined) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

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

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export default I18nProvider;