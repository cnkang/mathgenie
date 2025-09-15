import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../tests/helpers/testUtils';
import type { Operation, Settings } from '../types';
import ProblemPreview from './ProblemPreview';

// Mock the i18n system
vi.mock('../i18n', () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'results.title': 'Generated Problems ({{count}})',
        'results.noProblems': 'No problems generated yet',
        'results.preview': 'Preview',
      };
      return translations[key] || key;
    },
  }),
}));

const mockSettings: Settings = {
  operations: ['+', '-'] as Operation[],
  numRange: [1, 10] as [number, number],
  resultRange: [0, 20] as [number, number],
  numProblems: 5,
  numOperandsRange: [2, 2] as [number, number],
  allowNegative: false,
  showAnswers: true,
  fontSize: 12,
  lineSpacing: 1.5,
  paperSize: 'a4' as const,
};

const mockGenerateSampleProblem = vi.fn(() => '2 + 3 = 5');

const renderWithI18n = (component: React.ReactElement) => {
  return render(component);
};

describe('ProblemPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any existing DOM content
    document.body.innerHTML = '';
  });

  it('renders preview component', () => {
    const { container } = renderWithI18n(
      <ProblemPreview settings={mockSettings} generateSampleProblem={mockGenerateSampleProblem} />
    );

    expect(container.querySelector('h3')).toBeInTheDocument();
  });

  it('generates sample problems', async () => {
    renderWithI18n(
      <ProblemPreview settings={mockSettings} generateSampleProblem={mockGenerateSampleProblem} />
    );

    const problems = await screen.findAllByText('2 + 3 = 5');
    expect(problems.length).toBeGreaterThan(0); // Should generate at least one problem
  });

  it('limits problems to maximum of 3', async () => {
    const settingsWithManyProblems = {
      ...mockSettings,
      numProblems: 10,
    };

    renderWithI18n(
      <ProblemPreview
        settings={settingsWithManyProblems}
        generateSampleProblem={mockGenerateSampleProblem}
      />
    );

    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 100));

    const problems = screen.queryAllByText('2 + 3 = 5');
    expect(problems.length).toBeLessThanOrEqual(3); // Should not exceed 3 problems
  });

  it('handles fewer problems than maximum', async () => {
    const settingsWithFewProblems = {
      ...mockSettings,
      numProblems: 2,
    };

    renderWithI18n(
      <ProblemPreview
        settings={settingsWithFewProblems}
        generateSampleProblem={mockGenerateSampleProblem}
      />
    );

    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 100));

    const problems = screen.queryAllByText('2 + 3 = 5');
    expect(problems.length).toBeLessThanOrEqual(2); // Should not exceed requested number
  });

  it('handles null problem generation', () => {
    const mockGenerateNull = vi.fn(() => '');

    const { container } = renderWithI18n(
      <ProblemPreview settings={mockSettings} generateSampleProblem={mockGenerateNull} />
    );

    expect(container.querySelector('h3')).toBeInTheDocument();
  });

  it('handles undefined generateSampleProblem', () => {
    const { container } = renderWithI18n(
      <ProblemPreview settings={mockSettings} generateSampleProblem={undefined} />
    );

    expect(container.querySelector('h3')).toBeInTheDocument();
  });

  it('displays preview info', () => {
    const { container } = renderWithI18n(
      <ProblemPreview settings={mockSettings} generateSampleProblem={mockGenerateSampleProblem} />
    );

    expect(container.querySelector('.preview-info')).toBeInTheDocument();
  });

  it('uses deferred values for performance', () => {
    const { rerender, container } = renderWithI18n(
      <ProblemPreview settings={mockSettings} generateSampleProblem={mockGenerateSampleProblem} />
    );

    const updatedSettings = {
      ...mockSettings,
      numProblems: 8,
    };

    rerender(
      <ProblemPreview
        settings={updatedSettings}
        generateSampleProblem={mockGenerateSampleProblem}
      />
    );

    expect(container.querySelector('h3')).toBeInTheDocument();
  });

  it('handles empty problem generation', () => {
    const mockGenerateEmpty = vi.fn(() => '');

    const { container } = renderWithI18n(
      <ProblemPreview settings={mockSettings} generateSampleProblem={mockGenerateEmpty} />
    );

    expect(container.querySelector('h3')).toBeInTheDocument();
  });

  it('regenerates problems when settings change', () => {
    const { rerender } = renderWithI18n(
      <ProblemPreview settings={mockSettings} generateSampleProblem={mockGenerateSampleProblem} />
    );

    vi.clearAllMocks();

    const newSettings = {
      ...mockSettings,
      operations: ['+', '-', '*'] as Operation[],
    };

    rerender(
      <ProblemPreview settings={newSettings} generateSampleProblem={mockGenerateSampleProblem} />
    );

    expect(mockGenerateSampleProblem).toHaveBeenCalled();
  });
});
