import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import App from './App';

// Mock external dependencies
vi.mock('@vercel/speed-insights/react', () => ({
  SpeedInsights: () => <div data-testid='mocked-speed-insights'>Mocked Speed Insights</div>,
}));

vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
    internal: {
      pageSize: {
        getHeight: () => 297,
        getWidth: () => 210,
      },
    },
  })),
}));

// Create a mock state for language
let mockCurrentLanguage = 'en';
const mockChangeLanguage = vi.fn((lang: string) => {
  mockCurrentLanguage = lang;
});

// Mock the i18n system for consistent testing
vi.mock('./i18n', () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'app.title': 'MathGenie',
        'app.subtitle': 'Generate customized math problems for practice and learning',
        'operations.title': 'Select Operations',
        'operations.addition': 'Addition (+)',
        'operations.subtraction': 'Subtraction (-)',
        'operations.multiplication': 'Multiplication (×)',
        'operations.division': 'Division (÷)',
        'operations.help': 'Hold Ctrl/Cmd to select multiple operations',
        'settings.numProblems': 'Number of Problems',
        'settings.numberRange': 'Number Range',
        'settings.resultRange': 'Result Range',
        'settings.operandsRange': 'Number of Operands',
        'settings.allowNegative': 'Allow Negative Results',
        'settings.showAnswers': 'Show Answers',
        'settings.from': 'From',
        'settings.to': 'to',
        'pdf.title': 'PDF Settings',
        'pdf.fontSize': 'Font Size (pt)',
        'pdf.lineSpacing': 'Line Spacing (pt)',
        'pdf.paperSize': 'Paper Size',
        'buttons.generate': 'Generate Problems',
        'buttons.download': 'Download PDF',
        'buttons.generateDescription': 'Create new math problems with your current settings',
        'buttons.downloadDescription': 'Save your problems as a printable PDF file',
        'buttons.quizDescription': 'Test your skills with an interactive quiz',
        'results.title': 'Generated Problems ({{count}})',
        'results.noProblems': 'No problems generated yet',
        'accessibility.selectOperations': 'Select mathematical operations to include',
        'accessibility.numProblemsInput': 'Number of problems to generate',
        'accessibility.generateButton': 'Generate math problems with current settings',
        'accessibility.downloadButton': 'Download generated problems as PDF file',
        'language.select': 'Language',
        'presets.title': 'Quick Presets',
        'presets.beginner.name': 'Beginner (1-10)',
        'presets.beginner.description': 'Simple addition and subtraction',
        'presets.intermediate.name': 'Intermediate (1-50)',
        'presets.intermediate.description': 'All operations with medium numbers',
        'presets.advanced.name': 'Advanced (1-100)',
        'presets.advanced.description': 'All operations including division',
        'presets.multiplication.name': 'Multiplication Focus',
        'presets.multiplication.description': 'Focus on multiplication tables',
        'presets.apply': 'Apply',
        'presets.clickToApply': 'Click to apply',
        'infoPanel.quickActions.startQuiz': 'Start Quiz',
        'messages.success.problemsGenerated': 'Successfully generated {{count}} problems!',
        'messages.success.generated': 'Generated',
      };

      let result = translations[key] || key;

      // Handle parameter substitution
      if (params && typeof result === 'string') {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          const placeholder = '{{' + paramKey + '}}';
          result = result.replace(new RegExp(placeholder, 'g'), String(paramValue));
        });
      }

      return result;
    },
    get currentLanguage() {
      return mockCurrentLanguage;
    },
    changeLanguage: mockChangeLanguage,
    isLoading: false,
    languages: {
      en: { code: 'en', name: 'English', flag: '🇺🇸' },
      zh: { code: 'zh', name: '中文', flag: '🇨🇳' },
      es: { code: 'es', name: 'Español', flag: '🇪🇸' },
      fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
      de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      ja: { code: 'ja', name: '日本語', flag: '🇯🇵' },
    },
  }),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(component);
};

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('renders main application elements', async () => {
    renderWithProvider(<App />);

    await waitFor(() => {
      expect(screen.getByText(/MathGenie/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Number of problems/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Select mathematical operations/i)).toBeInTheDocument();
    });
  });

  test('generates problems when form is submitted', async () => {
    const user = userEvent.setup();
    renderWithProvider(<App />);

    await waitFor(() => screen.getByLabelText(/Number of problems/i));

    // Fill form
    await user.clear(screen.getByLabelText(/Number of problems/i));
    await user.type(screen.getByLabelText(/Number of problems/i), '5');

    // Generate problems using more specific selector
    const generateButton = screen.getByRole('button', {
      name: /Generate Problems.*Generate math problems/i,
    });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Successfully generated 5 problems!/i)).toBeInTheDocument();
    });
  });

  test('validates form inputs', async () => {
    const user = userEvent.setup();
    renderWithProvider(<App />);

    await waitFor(() => screen.getByLabelText(/Number of problems/i));

    // Enter invalid value
    await user.clear(screen.getByLabelText(/Number of problems/i));
    await user.type(screen.getByLabelText(/Number of problems/i), '0');

    // Try to generate
    const generateButton = screen.getByRole('button', {
      name: /Generate Problems.*Generate math problems/i,
    });
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  test('supports language switching', async () => {
    const user = userEvent.setup();
    renderWithProvider(<App />);

    await waitFor(() => screen.getByLabelText(/Language/i));

    const languageSelect = screen.getByLabelText(/Language/i);
    expect(languageSelect).toHaveValue('en'); // Initial value

    await user.selectOptions(languageSelect, 'zh');

    // Verify that changeLanguage was called with the correct language
    expect(mockChangeLanguage).toHaveBeenCalledWith('zh');
  });
});
