import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from '../tests/helpers/testUtils';

// Mock all external dependencies to prevent memory issues
vi.mock('@vercel/speed-insights/react', () => ({ SpeedInsights: () => null }));
vi.mock('jspdf', () => ({
  default: vi.fn(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
    internal: { pageSize: { getHeight: () => 297, getWidth: () => 210 } },
  })),
}));
vi.mock('./utils/wcagEnforcement', () => ({
  setupWCAGEnforcement: () => () => {},
  enforceWCAGTouchTargets: () => {},
}));

// Mock browser optimizations
vi.mock('./utils/browserOptimizations', () => ({
  applyBrowserSpecificStyles: vi.fn(),
  createPerformanceMonitor: () => ({
    logBrowserInfo: vi.fn(),
    measureDOMOperation: vi.fn(operation => operation()),
  }),
  getBrowserInfo: () => ({
    isFirefox: false,
    isChrome: true,
    isSafari: false,
    isEdge: false,
  }),
}));

// Mock i18n system
vi.mock('./i18n', () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='i18n-provider'>{children}</div>
  ),
  useTranslation: () => ({
    t: (key: string) => key,
    currentLanguage: 'en',
    changeLanguage: vi.fn(),
    isLoading: false,
    languages: {},
  }),
}));

// Mock all hooks
vi.mock('./hooks/useProblemGenerator', () => ({
  useProblemGenerator: () => ({
    problems: [],
    generateProblems: vi.fn(() => ({ error: '', warning: '', successMessage: '' })),
  }),
}));
vi.mock('./hooks/useSettings', () => ({
  useSettings: () => ({
    settings: {
      numProblems: 10,
      operations: ['addition'],
      numberRange: { min: 1, max: 10 },
      resultRange: { min: 1, max: 20 },
      operandsRange: { min: 2, max: 2 },
      allowNegative: false,
      showAnswers: true,
      fontSize: 12,
      lineSpacing: 20,
      paperSize: 'a4' as const,
      enableGrouping: false,
      problemsPerGroup: 20,
      totalGroups: 1,
    },
    setSettings: vi.fn(),
    validateSettings: vi.fn(() => ({ isValid: true, errors: [] })),
  }),
}));
vi.mock('./hooks/useSettingsValidation', () => ({
  useSettingsValidation: () => ({
    isValidationSensitiveField: vi.fn(() => false),
    checkRestrictiveSettings: vi.fn(() => ({ hasWarning: false, warning: '' })),
  }),
}));
vi.mock('./hooks/useAppMessages', () => ({
  useAppMessages: () => ({
    error: '',
    warning: '',
    successMessage: '',
    setError: vi.fn(),
    setWarning: vi.fn(),
    setSuccessMessage: vi.fn(),
    clearMessages: vi.fn(),
    showSuccessMessage: vi.fn(),
  }),
}));
// Note: Do not mock useAppLogic to avoid leaking mocks across files

// Mock all components
vi.mock('./components/AppHeader', () => ({
  default: () => <div data-testid='app-header'>App Header</div>,
}));
vi.mock('./components/SettingsSection', () => ({
  default: () => <div data-testid='settings-section'>Settings Section</div>,
}));
vi.mock('./components/ActionCards', () => ({
  default: () => <div data-testid='action-cards'>Action Cards</div>,
}));
vi.mock('./components/ProblemsSection', () => ({
  default: () => <div data-testid='problems-section'>Problems Section</div>,
}));
vi.mock('./components/InfoPanel', () => ({
  default: () => <div data-testid='info-panel'>Info Panel</div>,
}));
vi.mock('./components/ErrorMessage', () => ({
  default: () => <div data-testid='error-message'>Error Message</div>,
}));
vi.mock('./components/TranslationLoader', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='translation-loader'>{children}</div>
  ),
}));
vi.mock('./components/QuizMode', () => ({
  default: () => <div data-testid='quiz-mode'>Quiz Mode</div>,
}));

import App from './App';

describe('App Component', () => {
  // Ensure local mocks do not leak to other test files
  afterAll(() => {
    // Reset module registry and unmock local modules to avoid cross-file pollution
    vi.unmock('./hooks/useAppLogic');
    vi.resetModules();
  });
  test('renders without crashing', () => {
    const { getByTestId, unmount } = render(<App />);
    expect(getByTestId('translation-loader')).toBeInTheDocument();
    expect(getByTestId('app-header')).toBeInTheDocument();
    unmount();
  });

  test('renders main sections', () => {
    const { getByTestId, unmount } = render(<App />);
    expect(getByTestId('settings-section')).toBeInTheDocument();
    expect(getByTestId('action-cards')).toBeInTheDocument();
    expect(getByTestId('problems-section')).toBeInTheDocument();
    expect(getByTestId('info-panel')).toBeInTheDocument();
    unmount();
  });
});
