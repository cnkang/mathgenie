import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider, useTranslation } from './index';

// Mock dynamic imports
vi.mock('./translations/en.ts', () => ({
  default: {
    app: { title: 'MathGenie' },
    operations: { addition: 'Addition (+)' },
    test: { interpolation: 'Hello {{name}}!' },
  },
}));

vi.mock('./translations/zh.ts', () => ({
  default: {
    app: { title: 'MathGenie' },
    operations: { addition: 'Addition (+)' },
  },
}));

// Mock navigator.language
Object.defineProperty(navigator, 'language', {
  writable: true,
  value: 'en-US',
});

Object.defineProperty(navigator, 'languages', {
  writable: true,
  value: ['en-US', 'en'],
});

// Test component that uses the translation hook
const TestComponent: React.FC = () => {
  const { t, currentLanguage, changeLanguage, isLoading, languages } = useTranslation();

  return (
    <div>
      <div data-testid='current-language'>{currentLanguage}</div>
      <div data-testid='app-title'>{t('app.title')}</div>
      <div data-testid='missing-key'>{t('missing.key')}</div>
      <div data-testid='interpolation'>{t('test.interpolation', { name: 'World' })}</div>
      <div data-testid='loading'>{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid='languages-count'>{Object.keys(languages).length}</div>
      <button onClick={() => changeLanguage('zh')}>Change to Chinese</button>
      <button onClick={() => changeLanguage('invalid')}>Change to Invalid</button>
    </div>
  );
};

describe('I18n System', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('handles translation key parsing', () => {
    const getNestedValue = (obj: any, path: string): any => {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    const translations = {
      app: { title: 'MathGenie' },
      operations: { addition: 'Addition (+)' },
    };

    expect(getNestedValue(translations, 'app.title')).toBe('MathGenie');
    expect(getNestedValue(translations, 'operations.addition')).toBe('Addition (+)');
    expect(getNestedValue(translations, 'nonexistent.key')).toBeUndefined();
  });

  it('handles string interpolation', () => {
    const interpolate = (template: string, params: Record<string, any>): string => {
      return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return params[key] !== undefined ? String(params[key]) : match;
      });
    };

    expect(interpolate('Download PDF ({{count}} problems)', { count: 5 })).toBe(
      'Download PDF (5 problems)'
    );

    expect(interpolate('Hello {{name}}!', { name: 'World' })).toBe('Hello World!');

    expect(interpolate('No params', {})).toBe('No params');
  });

  it('handles localStorage operations safely', () => {
    const safeLocalStorage = {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
          return true;
        } catch {
          return false;
        }
      },
    };

    expect(safeLocalStorage.getItem('test')).toBeNull();
    expect(safeLocalStorage.setItem('test', 'value')).toBe(true);
    expect(safeLocalStorage.getItem('test')).toBe('value');
  });

  it('validates language codes', () => {
    const supportedLanguages = ['en', 'zh', 'es', 'fr', 'de', 'ja'];
    const isValidLanguage = (lang: string) => supportedLanguages.includes(lang);

    expect(isValidLanguage('en')).toBe(true);
    expect(isValidLanguage('zh')).toBe(true);
    expect(isValidLanguage('invalid')).toBe(false);
  });

  it('handles fallback behavior', () => {
    const getFallbackValue = (value: any, fallback: any) => {
      return value !== undefined && value !== null ? value : fallback;
    };

    expect(getFallbackValue('value', 'fallback')).toBe('value');
    expect(getFallbackValue(null, 'fallback')).toBe('fallback');
    expect(getFallbackValue(undefined, 'fallback')).toBe('fallback');
  });

  it('provides I18n context and translations', async () => {
    await act(async () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
    });

    expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    expect(screen.getByTestId('app-title')).toHaveTextContent('MathGenie');
    expect(screen.getByTestId('languages-count')).toHaveTextContent('6');
  });

  it('handles missing translation keys with fallback', async () => {
    await act(async () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
    });

    expect(screen.getByTestId('missing-key')).toHaveTextContent('missing.key');
  });

  it('handles string interpolation in translations', async () => {
    await act(async () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
    });

    expect(screen.getByTestId('interpolation')).toHaveTextContent('Hello World!');
  });

  it('throws error when useTranslation is used outside provider', () => {
    const TestComponentWithoutProvider = () => {
      const { t } = useTranslation();
      return <div>{t('test')}</div>;
    };

    expect(() => {
      render(<TestComponentWithoutProvider />);
    }).toThrow('useTranslation must be used within an I18nProvider');
  });

  it('uses browser language as default', async () => {
    // Set browser language to Chinese
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'zh-CN',
    });

    await act(async () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
    });

    expect(screen.getByTestId('current-language')).toHaveTextContent('zh');
  });

  it('falls back to English for unsupported browser language', async () => {
    // Set browser language to unsupported language
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'ko-KR',
    });

    await act(async () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
    });

    expect(screen.getByTestId('current-language')).toHaveTextContent('en');
  });

  it('uses localStorage language preference', async () => {
    localStorage.setItem('mathgenie-language', 'zh');

    await act(async () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
    });

    expect(screen.getByTestId('current-language')).toHaveTextContent('zh');
  });

  it('ignores invalid language change requests', async () => {
    await act(async () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
    });

    const invalidButton = screen.getByText('Change to Invalid');

    await act(async () => {
      invalidButton.click();
    });

    // Should remain English
    expect(screen.getByTestId('current-language')).toHaveTextContent('en');
  });

  it('handles missing navigator.languages gracefully', async () => {
    // Mock missing navigator.languages
    Object.defineProperty(navigator, 'languages', {
      writable: true,
      value: undefined,
    });

    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: undefined,
    });

    await act(async () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
    });

    // Should default to English
    expect(screen.getByTestId('current-language')).toHaveTextContent('en');
  });
});
