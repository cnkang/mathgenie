import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '../i18n';
import type { Operation, Settings } from '../types';
import ProblemPreview from './ProblemPreview';

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
  return render(<I18nProvider>{component}</I18nProvider>);
};

describe('ProblemPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders preview component', () => {
    renderWithI18n(
      <ProblemPreview settings={mockSettings} generateSampleProblem={mockGenerateSampleProblem} />,
    );

    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('generates sample problems', async () => {
    renderWithI18n(
      <ProblemPreview settings={mockSettings} generateSampleProblem={mockGenerateSampleProblem} />,
    );

    const problems = await screen.findAllByText('2 + 3 = 5');
    expect(problems).toHaveLength(3); // Math.min(3, 5) = 3
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
      />,
    );

    const problems = await screen.findAllByText('2 + 3 = 5');
    expect(problems).toHaveLength(3);
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
      />,
    );

    const problems = await screen.findAllByText('2 + 3 = 5');
    expect(problems).toHaveLength(2);
  });

  it('handles null problem generation', () => {
    const mockGenerateNull = vi.fn(() => '');

    renderWithI18n(
      <ProblemPreview settings={mockSettings} generateSampleProblem={mockGenerateNull} />,
    );

    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('handles undefined generateSampleProblem', () => {
    renderWithI18n(<ProblemPreview settings={mockSettings} generateSampleProblem={undefined} />);

    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('displays preview info', () => {
    renderWithI18n(
      <ProblemPreview settings={mockSettings} generateSampleProblem={mockGenerateSampleProblem} />,
    );

    expect(screen.getByText('preview.info')).toBeInTheDocument();
  });

  it('uses deferred values for performance', () => {
    const { rerender } = renderWithI18n(
      <ProblemPreview settings={mockSettings} generateSampleProblem={mockGenerateSampleProblem} />,
    );

    const updatedSettings = {
      ...mockSettings,
      numProblems: 8,
    };

    rerender(
      <I18nProvider>
        <ProblemPreview
          settings={updatedSettings}
          generateSampleProblem={mockGenerateSampleProblem}
        />
      </I18nProvider>,
    );

    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('handles empty problem generation', () => {
    const mockGenerateEmpty = vi.fn(() => '');

    renderWithI18n(
      <ProblemPreview settings={mockSettings} generateSampleProblem={mockGenerateEmpty} />,
    );

    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('regenerates problems when settings change', () => {
    const { rerender } = renderWithI18n(
      <ProblemPreview settings={mockSettings} generateSampleProblem={mockGenerateSampleProblem} />,
    );

    vi.clearAllMocks();

    const newSettings = {
      ...mockSettings,
      operations: ['+', '-', '*'] as Operation[],
    };

    rerender(
      <I18nProvider>
        <ProblemPreview settings={newSettings} generateSampleProblem={mockGenerateSampleProblem} />
      </I18nProvider>,
    );

    expect(mockGenerateSampleProblem).toHaveBeenCalled();
  });
});
