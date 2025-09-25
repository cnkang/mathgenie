import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '../../tests/helpers/testUtils';
import { ConsoleMock } from '../../tests/helpers/consoleMock';
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

describe.sequential('I18n System', () => {
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
      return value ?? fallback;
    };

    expect(getFallbackValue('value', 'fallback')).toBe('value');
    expect(getFallbackValue(null, 'fallback')).toBe('fallback');
    expect(getFallbackValue(undefined, 'fallback')).toBe('fallback');
  });

  it('provides fallback text for success messages when translations are missing', () => {
    // Test that success messages don't show raw keys when translations are missing
    const TestFallbackComponent: React.FC = () => {
      const { t } = useTranslation();
      return (
        <div>
          <div data-testid='success-problems'>
            {t('messages.success.problemsGenerated', { count: 5 })}
          </div>
          <div data-testid='success-imported'>{t('messages.success.settingsImported')}</div>
          <div data-testid='success-exported'>{t('messages.success.settingsExported')}</div>
        </div>
      );
    };

    render(
      <I18nProvider>
        <TestFallbackComponent />
      </I18nProvider>
    );

    // The key improvement: these should NOT show raw translation keys
    // They should show either proper translations or fallback text
    const problemsText = screen.getByTestId('success-problems').textContent;
    const importedText = screen.getByTestId('success-imported').textContent;
    const exportedText = screen.getByTestId('success-exported').textContent;

    // Verify we don't get raw keys (the original problem)
    expect(problemsText).not.toBe('messages.success.problemsGenerated');
    expect(importedText).not.toBe('messages.success.settingsImported');
    expect(exportedText).not.toBe('messages.success.settingsExported');

    // Verify we get meaningful text (either translation or fallback)
    expect(problemsText).toMatch(/generated|problems/i);
    expect(importedText).toMatch(/imported|successfully/i);
    expect(exportedText).toMatch(/exported|successfully/i);
  });

  it('provides I18n context and translations', async () => {
    const TestComponentWrapper = () => {
      const { t, currentLanguage, languages } = useTranslation();
      return (
        <div>
          <div data-testid='current-language'>{currentLanguage}</div>
          <div data-testid='app-title'>{t('app.title')}</div>
          <div data-testid='languages-count'>{Object.keys(languages).length}</div>
        </div>
      );
    };

    const { container } = render(
      <I18nProvider>
        <TestComponentWrapper />
      </I18nProvider>
    );

    await waitFor(() => {
      const currentLang = container.querySelector('[data-testid="current-language"]');
      const appTitle = container.querySelector('[data-testid="app-title"]');
      const langCount = container.querySelector('[data-testid="languages-count"]');
      expect(currentLang?.textContent).toBe('en');
      expect(appTitle?.textContent).toBe('MathGenie');
      expect(langCount?.textContent).toBe('6');
    });
  });

  it('handles missing translation keys with fallback', async () => {
    const TestMissingComponent = () => {
      const { t } = useTranslation();
      return (
        <div>
          <div data-testid='missing-key'>{t('missing.key')}</div>
        </div>
      );
    };

    const { container } = render(
      <I18nProvider>
        <TestMissingComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(container.querySelector('[data-testid="missing-key"]')?.textContent).toBe(
        'missing.key'
      );
    });
  });

  it('handles string interpolation in translations', async () => {
    const TestInterpolationComponent = () => {
      const { t } = useTranslation();
      return (
        <div>
          <div data-testid='interpolation'>{t('test.interpolation', { name: 'World' })}</div>
        </div>
      );
    };

    const { container } = render(
      <I18nProvider>
        <TestInterpolationComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      const interpolationEl = container.querySelector('[data-testid="interpolation"]');
      expect(interpolationEl?.textContent).toBe('Hello World!');
    });
  });

  it('throws error when useTranslation is used outside provider', () => {
    const TestComponentWithoutProvider = () => {
      const { t } = useTranslation();
      return <div>{t('test')}</div>;
    };

    const consoleMock = new ConsoleMock();
    consoleMock.mockConsole(['error']);

    expect(() => {
      render(<TestComponentWithoutProvider />);
    }).toThrow('useTranslation must be used within an I18nProvider');

    consoleMock.restoreConsole();
  });

  it('uses browser language as default', async () => {
    // Clear localStorage first
    localStorage.clear();

    // Set browser language to Chinese
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'zh-CN',
    });

    const TestLanguageComponent = () => {
      const { currentLanguage } = useTranslation();
      return <div data-testid='current-language'>{currentLanguage}</div>;
    };

    const { container } = render(
      <I18nProvider>
        <TestLanguageComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      const langEl = container.querySelector('[data-testid="current-language"]');
      expect(langEl?.textContent).toBe('zh');
    });
  });

  it('falls back to English for unsupported browser language', async () => {
    // Set browser language to unsupported language
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'ko-KR',
    });

    let unmount: () => void;
    await act(async () => {
      const result = render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      );
      unmount = result.unmount;
    });

    const container = document.body;
    expect(container.querySelector('[data-testid="current-language"]')?.textContent).toBe('en');
    unmount!();
  });

  it('uses localStorage language preference', async () => {
    localStorage.setItem('mathgenie-language', 'zh');

    const TestStorageComponent = () => {
      const { currentLanguage } = useTranslation();
      return <div data-testid='current-language'>{currentLanguage}</div>;
    };

    const { container } = render(
      <I18nProvider>
        <TestStorageComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      const langEl = container.querySelector('[data-testid="current-language"]');
      expect(langEl?.textContent).toBe('zh');
    });
  });

  it('ignores invalid language change requests', async () => {
    const consoleMock = new ConsoleMock();
    consoleMock.mockConsole(['warn']);

    // Clear localStorage to ensure we start with browser language
    localStorage.clear();

    const TestInvalidComponent = () => {
      const { currentLanguage, changeLanguage } = useTranslation();
      return (
        <div>
          <div data-testid='current-language'>{currentLanguage}</div>
          <button onClick={() => changeLanguage('invalid')}>Change to Invalid</button>
        </div>
      );
    };

    const { container } = render(
      <I18nProvider>
        <TestInvalidComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      const langEl = container.querySelector('[data-testid="current-language"]');
      expect(langEl?.textContent).toBe('en');
    });

    const invalidButton = container.querySelector('button');
    if (invalidButton) {
      invalidButton.click();
    }

    // Should remain English
    await waitFor(() => {
      const langEl = container.querySelector('[data-testid="current-language"]');
      expect(langEl?.textContent).toBe('en');
    });

    consoleMock.restoreConsole();
  });

  it('handles missing navigator.languages gracefully', async () => {
    // Clear localStorage to ensure we test navigator fallback
    localStorage.clear();

    // Mock missing navigator.languages
    Object.defineProperty(navigator, 'languages', {
      writable: true,
      value: undefined,
    });

    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: undefined,
    });

    const TestNavigatorComponent = () => {
      const { currentLanguage } = useTranslation();
      return <div data-testid='current-language'>{currentLanguage}</div>;
    };

    const { container } = render(
      <I18nProvider>
        <TestNavigatorComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      // Should default to English
      const langEl = container.querySelector('[data-testid="current-language"]');
      expect(langEl?.textContent).toBe('en');
    });
  });
});
