import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '../../tests/helpers/testUtils';
import type { Settings } from '../types';
import InfoPanel from './InfoPanel';

// Mock the translation system
vi.mock('../i18n', async () => {
  const { mockUseTranslation } = await import('../../tests/helpers/mockTranslations');
  return mockUseTranslation({
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
    'messages.loading': 'Loading...',
  });
});

// Mock LoadingButton to avoid act warnings from internal state updates
vi.mock('./LoadingButton', () => ({
  __esModule: true,
  default: ({ onClick, children, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} aria-label='Download PDF'>
      {children}
    </button>
  ),
}));

// Mock the progress bar hook
vi.mock('../hooks/useProgressBar', () => ({
  useProgressBar: vi.fn(() => ({
    progress: 0,
    isVisible: false,
  })),
}));

describe.sequential('InfoPanel', () => {
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
    enableGrouping: false,
    problemsPerGroup: 20,
    totalGroups: 1,
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

    // Check specific statistics using aria-labels - use getAllByLabelText for multiple instances
    expect(screen.getAllByLabelText('Current Problems: 0')[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText('Total Generated: 0')[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText('Operation Types: 0')[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText('Difficulty Level: Beginner')[0]).toBeInTheDocument();

    // Check that difficulty level text is displayed
    expect(screen.getAllByText('Beginner')[0]).toBeInTheDocument();
  });

  test('displays statistics correctly with problems', () => {
    const mockProblems = [
      { id: 1, text: '2 + 3 = ' },
      { id: 2, text: '5 - 1 = ' },
      { id: 3, text: '4 + 6 = ' },
    ];

    render(<InfoPanel problems={mockProblems} settings={mockSettings} />);

    // Should show actual problem count
    expect(screen.getAllByLabelText('Current Problems: 3')[0]).toBeInTheDocument();

    // Should show operation types count (2 for ['+', '-'])
    expect(screen.getAllByLabelText('Operation Types: 2')[0]).toBeInTheDocument();

    // Should still show Beginner difficulty for simple settings
    expect(screen.getAllByLabelText('Difficulty Level: Beginner')[0]).toBeInTheDocument();
  });

  test('renders without crashing with empty problems', () => {
    render(<InfoPanel problems={[]} settings={mockSettings} />);

    // Should render without errors - use getAllByText to handle multiple instances
    expect(screen.getAllByText('Problem Statistics')[0]).toBeInTheDocument();
  });

  test('calls onDownloadPdf when download button is clicked', async () => {
    const mockDownload = vi.fn().mockResolvedValue(undefined);
    const mockProblems = [{ id: 1, text: '2 + 2 = ' }];

    render(
      <InfoPanel problems={mockProblems} settings={mockSettings} onDownloadPdf={mockDownload} />
    );

    // Find the enabled download button - there might be multiple but we want the enabled one
    const downloadButtons = screen.getAllByRole('button', { name: /download pdf/i });
    const enabledButton = downloadButtons.find(button => !button.disabled);
    expect(enabledButton).toBeInTheDocument();

    if (!enabledButton) {
      throw new Error('Expected an enabled download button to be present');
    }

    fireEvent.click(enabledButton);
    expect(mockDownload).toHaveBeenCalledTimes(1);
  });

  test('disables download button when no problems', async () => {
    const mockDownload = vi.fn().mockResolvedValue(undefined);
    render(<InfoPanel problems={[]} settings={mockSettings} onDownloadPdf={mockDownload} />);

    const downloadButtons = screen.getAllByRole('button', { name: /download pdf/i });
    const button = downloadButtons[0] as HTMLButtonElement;
    expect(button).toBeInTheDocument();
    expect(button.disabled).toBe(true);
  });
});
