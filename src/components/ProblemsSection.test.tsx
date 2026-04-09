import type { Operation, Settings } from '@/types';
import { fireEvent, render, screen, waitFor } from '../../tests/helpers/testUtils';
import { afterEach, vi } from 'vitest';
import ProblemsSection from './ProblemsSection';

describe.sequential('ProblemsSection', () => {
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard,
    });
  });

  const t = (key: string, params?: Record<string, string | number>) => {
    if (key === 'results.title') {
      return `Generated Problems (${params?.count ?? 0})`;
    }
    return key;
  };

  const mockSettings: Settings = {
    operations: ['+'] as Operation[],
    numProblems: 5,
    numRange: [1, 10] as [number, number],
    resultRange: [0, 20] as [number, number],
    numOperandsRange: [2, 2] as [number, number],
    allowNegative: false,
    showAnswers: false,
    fontSize: 12,
    lineSpacing: 1.5,
    paperSize: 'a4' as const,
    enableGrouping: false,
    problemsPerGroup: 20,
    totalGroups: 1,
  };

  test('renders empty state', () => {
    render(<ProblemsSection t={t} problems={[]} settings={mockSettings} />);

    expect(screen.getByRole('heading', { name: /generated problems/i })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('results.noProblems');
    expect(screen.getByLabelText('accessibility.problemsList')).toHaveAttribute('tabindex', '0');
  });

  test('renders problems list', () => {
    const problems = [
      { id: 1, text: '1 + 2 = ' },
      { id: 2, text: '3 + 4 = ' },
    ];
    render(<ProblemsSection t={t} problems={problems as any} settings={mockSettings} />);

    expect(screen.getByRole('heading', { name: /generated problems \(2\)/i })).toBeInTheDocument();
    const items = screen.getAllByText(/=\s*$/);
    expect(items.length).toBe(2);
  });

  test('renders grouped problems when grouping is enabled', () => {
    const problems = [
      { id: 1, text: '1 + 2 = ' },
      { id: 2, text: '3 + 4 = ' },
      { id: 3, text: '5 + 6 = ' },
      { id: 4, text: '7 + 8 = ' },
    ];

    const groupedSettings = {
      ...mockSettings,
      enableGrouping: true,
      problemsPerGroup: 2,
      totalGroups: 2,
    };

    const tWithGrouping = (key: string, params?: Record<string, string | number>) => {
      if (key === 'results.title') {
        return `Generated Problems (${params?.count ?? 0})`;
      }
      if (key === 'results.groupTitle') {
        return `Group ${params?.number}`;
      }
      if (key === 'results.groupingInfo') {
        return `${params?.groups} groups, ${params?.perGroup} problems each`;
      }
      return key;
    };

    render(
      <ProblemsSection t={tWithGrouping} problems={problems as any} settings={groupedSettings} />
    );

    // Should show grouping info
    expect(screen.getByText('2 groups, 2 problems each')).toBeInTheDocument();

    // Should show group titles
    expect(screen.getByText('Group 1')).toBeInTheDocument();
    expect(screen.getByText('Group 2')).toBeInTheDocument();

    // Should show all problems
    expect(screen.getByText('1 + 2 =')).toBeInTheDocument();
    expect(screen.getByText('3 + 4 =')).toBeInTheDocument();
    expect(screen.getByText('5 + 6 =')).toBeInTheDocument();
    expect(screen.getByText('7 + 8 =')).toBeInTheDocument();
  });

  test('handles empty groups when grouping is enabled', () => {
    const problems = [{ id: 1, text: '1 + 2 = ' }];

    const groupedSettings = {
      ...mockSettings,
      enableGrouping: true,
      problemsPerGroup: 2,
      totalGroups: 2,
    };

    const tWithGrouping = (key: string, params?: Record<string, string | number>) => {
      if (key === 'results.title') {
        return `Generated Problems (${params?.count ?? 0})`;
      }
      if (key === 'results.groupTitle') {
        return `Group ${params?.number}`;
      }
      if (key === 'results.groupingInfo') {
        return `${params?.groups} groups, ${params?.perGroup} problems each`;
      }
      if (key === 'problems.emptyGroup') {
        return `Group ${params?.group} (no problems)`;
      }
      return key;
    };

    render(
      <ProblemsSection t={tWithGrouping} problems={problems as any} settings={groupedSettings} />
    );

    // Should show group title for non-empty group and placeholder for empty group
    expect(screen.getByText('Group 1')).toBeInTheDocument();
    expect(screen.getByText('Group 2 (no problems)')).toBeInTheDocument();

    // Should show the one problem
    expect(screen.getByText('1 + 2 =')).toBeInTheDocument();
  });

  test('renders accessibility attributes correctly', () => {
    const problems = [{ id: 1, text: '1 + 2 = ' }];
    render(<ProblemsSection t={t} problems={problems as any} settings={mockSettings} />);

    const problemsContent = screen.getByLabelText('accessibility.problemsList');
    expect(problemsContent).toHaveAttribute('aria-live', 'polite');
    expect(problemsContent).toHaveAttribute('tabIndex', '0');
    expect(problemsContent).toHaveAttribute('aria-labelledby', 'results-title');
  });

  test('shows grouping info only when grouping is enabled and problems exist', () => {
    const problems = [{ id: 1, text: '1 + 2 = ' }];

    // Test without grouping
    render(<ProblemsSection t={t} problems={problems as any} settings={mockSettings} />);
    expect(screen.queryByText(/groups/)).not.toBeInTheDocument();

    // Test with grouping but no problems
    const groupedSettings = { ...mockSettings, enableGrouping: true };
    render(<ProblemsSection t={t} problems={[]} settings={groupedSettings} />);
    expect(screen.queryByText(/groups/)).not.toBeInTheDocument();
  });

  test('disables copy button when there are no problems', () => {
    render(<ProblemsSection t={t} problems={[]} settings={mockSettings} />);

    const copyButton = screen.getByRole('button', { name: /copy generated problems/i });
    expect(copyButton).toHaveAttribute('disabled');
  });

  test('copies generated problems to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const problems = [
      { id: 1, text: '1 + 2 = ' },
      { id: 2, text: '3 + 4 = ' },
    ];

    render(<ProblemsSection t={t} problems={problems as any} settings={mockSettings} />);

    const copyButton = screen.getByRole('button', { name: /copy generated problems/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('1. 1 + 2 =\n2. 3 + 4 =');
    });
    expect(screen.getByText('Problems copied to clipboard.')).toBeInTheDocument();
  });
});
