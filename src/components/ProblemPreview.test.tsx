import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProblemPreview from './ProblemPreview';
import { I18nProvider } from '../i18n';

const mockSettings = {
  operations: ['+', '-'],
  numberRange: { min: 1, max: 10 },
  resultRange: { min: 0, max: 20 },
  numProblems: 5,
  operandsRange: { min: 2, max: 2 },
  allowNegativeResults: false,
  showAnswers: true,
  fontSize: 12,
  lineSpacing: 1.5,
  paperSize: 'A4' as const
};

const mockGenerateSampleProblem = vi.fn(() => '2 + 3 = 5');

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nProvider>
      {component}
    </I18nProvider>
  );
};

describe('ProblemPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders preview component', () => {
    renderWithI18n(
      <ProblemPreview 
        settings={mockSettings} 
        generateSampleProblem={mockGenerateSampleProblem} 
      />
    );
    
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('generates sample problems', async () => {
    renderWithI18n(
      <ProblemPreview 
        settings={mockSettings} 
        generateSampleProblem={mockGenerateSampleProblem} 
      />
    );
    
    const problems = await screen.findAllByText('2 + 3 = 5');
    expect(problems).toHaveLength(3); // Math.min(3, 5) = 3
  });

  it('limits problems to maximum of 3', async () => {
    const settingsWithManyProblems = {
      ...mockSettings,
      numProblems: 10
    };
    
    renderWithI18n(
      <ProblemPreview 
        settings={settingsWithManyProblems} 
        generateSampleProblem={mockGenerateSampleProblem} 
      />
    );
    
    const problems = await screen.findAllByText('2 + 3 = 5');
    expect(problems).toHaveLength(3);
  });

  it('handles fewer problems than maximum', async () => {
    const settingsWithFewProblems = {
      ...mockSettings,
      numProblems: 2
    };
    
    renderWithI18n(
      <ProblemPreview 
        settings={settingsWithFewProblems} 
        generateSampleProblem={mockGenerateSampleProblem} 
      />
    );
    
    const problems = await screen.findAllByText('2 + 3 = 5');
    expect(problems).toHaveLength(2);
  });

  it('handles null problem generation', () => {
    const mockGenerateNull = vi.fn(() => null);
    
    renderWithI18n(
      <ProblemPreview 
        settings={mockSettings} 
        generateSampleProblem={mockGenerateNull} 
      />
    );
    
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('handles undefined generateSampleProblem', () => {
    renderWithI18n(
      <ProblemPreview 
        settings={mockSettings} 
        generateSampleProblem={undefined} 
      />
    );
    
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('displays preview info', () => {
    renderWithI18n(
      <ProblemPreview 
        settings={mockSettings} 
        generateSampleProblem={mockGenerateSampleProblem} 
      />
    );
    
    expect(screen.getByText('preview.info')).toBeInTheDocument();
  });

  it('uses deferred values for performance', () => {
    const { rerender } = renderWithI18n(
      <ProblemPreview 
        settings={mockSettings} 
        generateSampleProblem={mockGenerateSampleProblem} 
      />
    );
    
    const updatedSettings = {
      ...mockSettings,
      numProblems: 8
    };
    
    rerender(
      <I18nProvider>
        <ProblemPreview 
          settings={updatedSettings} 
          generateSampleProblem={mockGenerateSampleProblem} 
        />
      </I18nProvider>
    );
    
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('handles empty problem generation', () => {
    const mockGenerateEmpty = vi.fn(() => '');
    
    renderWithI18n(
      <ProblemPreview 
        settings={mockSettings} 
        generateSampleProblem={mockGenerateEmpty} 
      />
    );
    
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('regenerates problems when settings change', () => {
    const { rerender } = renderWithI18n(
      <ProblemPreview 
        settings={mockSettings} 
        generateSampleProblem={mockGenerateSampleProblem} 
      />
    );
    
    vi.clearAllMocks();
    
    const newSettings = {
      ...mockSettings,
      operations: ['+', '-', '*']
    };
    
    rerender(
      <I18nProvider>
        <ProblemPreview 
          settings={newSettings} 
          generateSampleProblem={mockGenerateSampleProblem} 
        />
      </I18nProvider>
    );
    
    expect(mockGenerateSampleProblem).toHaveBeenCalled();
  });
});