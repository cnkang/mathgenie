import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { Settings } from '../types';
import InfoPanel from './InfoPanel';

// Mock the translation system
vi.mock('../i18n', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'infoPanel.title': 'Problem Statistics',
        'infoPanel.difficulty.beginner': 'Beginner',
        'infoPanel.difficulty.intermediate': 'Intermediate',
        'infoPanel.difficulty.advanced': 'Advanced',
        'infoPanel.difficulty.expert': 'Expert',
        'infoPanel.stats.currentProblems': 'Current Problems',
        'infoPanel.stats.totalGenerated': 'Total Generated',
        'infoPanel.stats.operationTypes': 'Operation Types',
        'infoPanel.stats.difficultyLevel': 'Difficulty Level',
        'infoPanel.progress.title': 'Learning Progress',
        'infoPanel.progress.completed': '{{percent}}% completed (Goal: 100 problems)',
        'infoPanel.quickActions.title': 'Quick Actions',
        'infoPanel.quickActions.regenerate': 'Regenerate Problems',
        'infoPanel.quickActions.downloadPdf': 'Download PDF',
        'infoPanel.quickActions.startQuiz': 'Start Quiz',
        'infoPanel.quickActions.jumpToProblems': 'Jump to Problems',
        'infoPanel.tips.title': 'Usage Tips',
        'infoPanel.tips.items.0': 'Use quick presets for common settings',
        'infoPanel.tips.items.1': 'More operands increase difficulty',
        'infoPanel.tips.items.2': 'Limiting result range controls answer complexity',
        'infoPanel.tips.items.3': 'Show answers helps with learning verification',
        'infoPanel.tips.items.4': 'PDF export supports various paper formats',
        'infoPanel.currentConfig.title': 'Current Configuration',
        'infoPanel.currentConfig.operations': 'Operations: {{operations}}',
        'infoPanel.currentConfig.numbers': 'Numbers: {{min}}-{{max}}',
        'infoPanel.currentConfig.results': 'Results: {{min}}-{{max}}',
        'infoPanel.currentConfig.operands': 'Operands: {{min}}-{{max}}',
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
  })),
}));

// Mock the progress bar hook
vi.mock('../hooks/useProgressBar', () => ({
  useProgressBar: vi.fn(() => ({
    progress: 0,
    isVisible: false,
  })),
}));

describe('InfoPanel', () => {
  const mockSettings: Settings = {
    numProblems: 10,
    operations: ['+', '-'],
    numRange: [1, 20],
    numOperandsRange: [2, 3],
    resultRange: [1, 40],
    allowNegative: false,
    showAnswers: false,
    fontSize: 12,
    lineSpacing: 1.5,
    paperSize: 'a4' as const,
  };

  test('renders with proper structure and content', () => {
    render(<InfoPanel problems={[]} settings={mockSettings} />);

    expect(screen.getByText('Problem Statistics')).toBeInTheDocument();
    expect(screen.getByText('Current Problems')).toBeInTheDocument();
    expect(screen.getByText('Operation Types')).toBeInTheDocument();
    expect(screen.getByText('Difficulty Level')).toBeInTheDocument();
  });

  test('displays statistics correctly', () => {
    render(<InfoPanel problems={[]} settings={mockSettings} />);

    // Check specific statistics using aria-labels
    expect(screen.getByLabelText('Current Problems: 0')).toBeInTheDocument();
    expect(screen.getByLabelText('Total Generated: 0')).toBeInTheDocument();
    expect(screen.getByLabelText('Operation Types: 0')).toBeInTheDocument();
    expect(screen.getByLabelText('Difficulty Level: Beginner')).toBeInTheDocument();

    // Check that difficulty level text is displayed
    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  test('displays statistics correctly with problems', () => {
    const mockProblems = [
      { id: 1, text: '2 + 3 = ' },
      { id: 2, text: '5 - 1 = ' },
      { id: 3, text: '4 + 6 = ' },
    ];

    render(<InfoPanel problems={mockProblems} settings={mockSettings} />);

    // Should show actual problem count
    expect(screen.getByLabelText('Current Problems: 3')).toBeInTheDocument();

    // Should show operation types count (2 for ['+', '-'])
    expect(screen.getByLabelText('Operation Types: 2')).toBeInTheDocument();

    // Should still show Beginner difficulty for simple settings
    expect(screen.getByLabelText('Difficulty Level: Beginner')).toBeInTheDocument();
  });

  test('renders without crashing with empty problems', () => {
    render(<InfoPanel problems={[]} settings={mockSettings} />);

    // Should render without errors
    expect(screen.getByText('Problem Statistics')).toBeInTheDocument();
  });
});
