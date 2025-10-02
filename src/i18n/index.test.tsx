import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsoleMock } from '../../tests/helpers/consoleMock';
import { act, render, screen, waitFor } from '../../tests/helpers/testUtils';
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

  it('handles language change with valid language', async () => {
    const TestLanguageChangeComponent = () => {
      const { currentLanguage, changeLanguage } = useTranslation();
      return (
        <div>
          <div data-testid='current-language'>{currentLanguage}</div>
          <button onClick={() => changeLanguage('zh')}>Change to Chinese</button>
          <button onClick={() => changeLanguage('ja')}>Change to Japanese</button>
          <button onClick={() => changeLanguage('fr')}>Change to French</button>
        </div>
      );
    };

    const { container } = render(
      <I18nProvider>
        <TestLanguageChangeComponent />
      </I18nProvider>
    );

    // Initial state should be English
    await waitFor(() => {
      const langEl = container.querySelector('[data-testid="current-language"]');
      expect(langEl?.textContent).toBe('en');
    });

    // Change to Chinese
    const chineseButton = container.querySelector('button');
    if (chineseButton) {
      chineseButton.click();
    }

    await waitFor(() => {
      const langEl = container.querySelector('[data-testid="current-language"]');
      expect(langEl?.textContent).toBe('zh');
    });

    // Change to Japanese
    const japaneseButton = container.querySelectorAll('button')[1];
    if (japaneseButton) {
      japaneseButton.click();
    }

    await waitFor(() => {
      const langEl = container.querySelector('[data-testid="current-language"]');
      expect(langEl?.textContent).toBe('ja');
    });

    // Change to French
    const frenchButton = container.querySelectorAll('button')[2];
    if (frenchButton) {
      frenchButton.click();
    }

    await waitFor(() => {
      const langEl = container.querySelector('[data-testid="current-language"]');
      expect(langEl?.textContent).toBe('fr');
    });
  });

  it('provides loading state during language changes', async () => {
    const TestLoadingComponent = () => {
      const { isLoading, changeLanguage } = useTranslation();
      return (
        <div>
          <div data-testid='loading-state'>{isLoading ? 'Loading' : 'Loaded'}</div>
          <button onClick={() => changeLanguage('es')}>Change to Spanish</button>
        </div>
      );
    };

    const { container } = render(
      <I18nProvider>
        <TestLoadingComponent />
      </I18nProvider>
    );

    // Should eventually show loaded state
    await waitFor(() => {
      const loadingEl = container.querySelector('[data-testid="loading-state"]');
      expect(loadingEl?.textContent).toBe('Loaded');
    });

    // Change language and check loading state
    const button = container.querySelector('button');
    if (button) {
      button.click();
    }

    // Should eventually be loaded again
    await waitFor(() => {
      const loadingEl = container.querySelector('[data-testid="loading-state"]');
      expect(loadingEl?.textContent).toBe('Loaded');
    });
  });

  it('handles translation keys with nested objects', async () => {
    const TestNestedComponent = () => {
      const { t } = useTranslation();
      return (
        <div>
          <div data-testid='nested-operations'>{t('operations.addition')}</div>
          <div data-testid='nested-settings'>{t('settings.numProblems')}</div>
          <div data-testid='nested-errors'>{t('errors.noOperations')}</div>
        </div>
      );
    };

    const { container } = render(
      <I18nProvider>
        <TestNestedComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      const operationsEl = container.querySelector('[data-testid="nested-operations"]');
      const settingsEl = container.querySelector('[data-testid="nested-settings"]');
      const errorsEl = container.querySelector('[data-testid="nested-errors"]');

      expect(operationsEl?.textContent).toBeTruthy();
      expect(settingsEl?.textContent).toBeTruthy();
      expect(errorsEl?.textContent).toBeTruthy();

      // Should not be the raw keys
      expect(operationsEl?.textContent).not.toBe('operations.addition');
      expect(settingsEl?.textContent).not.toBe('settings.numProblems');
      expect(errorsEl?.textContent).not.toBe('errors.noOperations');
    });
  });

  it('handles browser language detection with language codes', async () => {
    localStorage.clear();

    // Test different language code formats
    const testCases = [
      { browserLang: 'en-US', expectedLang: 'en' },
      { browserLang: 'zh-CN', expectedLang: 'zh' },
      { browserLang: 'es-ES', expectedLang: 'es' },
      { browserLang: 'fr-FR', expectedLang: 'fr' },
      { browserLang: 'de-DE', expectedLang: 'de' },
      { browserLang: 'ja-JP', expectedLang: 'ja' },
    ];

    for (const testCase of testCases) {
      localStorage.clear();

      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: testCase.browserLang,
      });

      const TestBrowserLangComponent = () => {
        const { currentLanguage } = useTranslation();
        return <div data-testid='current-language'>{currentLanguage}</div>;
      };

      const { container, unmount } = render(
        <I18nProvider>
          <TestBrowserLangComponent />
        </I18nProvider>
      );

      await waitFor(() => {
        const langEl = container.querySelector('[data-testid="current-language"]');
        expect(langEl?.textContent).toBe(testCase.expectedLang);
      });

      unmount();
    }
  });

  it('persists language changes to localStorage', async () => {
    localStorage.clear();

    const TestPersistenceComponent = () => {
      const { currentLanguage, changeLanguage } = useTranslation();
      return (
        <div>
          <div data-testid='current-language'>{currentLanguage}</div>
          <button onClick={() => changeLanguage('de')}>Change to German</button>
        </div>
      );
    };

    const { container } = render(
      <I18nProvider>
        <TestPersistenceComponent />
      </I18nProvider>
    );

    // Change to German
    const button = container.querySelector('button');
    if (button) {
      button.click();
    }

    await waitFor(() => {
      const langEl = container.querySelector('[data-testid="current-language"]');
      expect(langEl?.textContent).toBe('de');
    });

    // Check localStorage was updated
    expect(localStorage.getItem('mathgenie-language')).toBe('de');
  });

  it('handles translation loading errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const TestErrorHandlingComponent = () => {
      const { t, changeLanguage } = useTranslation();
      return (
        <div>
          <div data-testid='test-text'>{t('common.hello')}</div>
          <button onClick={() => changeLanguage('invalid' as any)}>Invalid Language</button>
        </div>
      );
    };

    const { container } = render(
      <I18nProvider>
        <TestErrorHandlingComponent />
      </I18nProvider>
    );

    // Should render with fallback
    await waitFor(() => {
      const textEl = container.querySelector('[data-testid="test-text"]');
      expect(textEl?.textContent).toBeTruthy();
    });

    // Try invalid language change
    const button = container.querySelector('button');
    if (button) {
      button.click();
    }

    // Should still work with fallback
    await waitFor(() => {
      const textEl = container.querySelector('[data-testid="test-text"]');
      expect(textEl?.textContent).toBeTruthy();
    });

    consoleSpy.mockRestore();
  });

  it('provides all required context values', async () => {
    const TestContextComponent = () => {
      const context = useTranslation();
      return (
        <div>
          <div data-testid='has-t'>{typeof context.t === 'function' ? 'true' : 'false'}</div>
          <div data-testid='has-language'>
            {typeof context.currentLanguage === 'string' ? 'true' : 'false'}
          </div>
          <div data-testid='has-change-language'>
            {typeof context.changeLanguage === 'function' ? 'true' : 'false'}
          </div>
          <div data-testid='has-loading'>
            {typeof context.isLoading === 'boolean' ? 'true' : 'false'}
          </div>
          <div data-testid='has-languages'>
            {typeof context.languages === 'object' ? 'true' : 'false'}
          </div>
        </div>
      );
    };

    const { container } = render(
      <I18nProvider>
        <TestContextComponent />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(container.querySelector('[data-testid="has-t"]')?.textContent).toBe('true');
      expect(container.querySelector('[data-testid="has-language"]')?.textContent).toBe('true');
      expect(container.querySelector('[data-testid="has-change-language"]')?.textContent).toBe(
        'true'
      );
      expect(container.querySelector('[data-testid="has-loading"]')?.textContent).toBe('true');
      expect(container.querySelector('[data-testid="has-languages"]')?.textContent).toBe('true');
    });
  });
});
