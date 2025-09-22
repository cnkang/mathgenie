import React from 'react';
import { render, screen } from '../../tests/helpers/testUtils';
import ProblemsSection from './ProblemsSection';

describe.sequential('ProblemsSection', () => {
  const t = (key: string, params?: Record<string, string | number>) => {
    if (key === 'results.title') {
      return `Generated Problems (${params?.count ?? 0})`;
    }
    return key;
  };

  test('renders empty state', () => {
    render(<ProblemsSection t={t} problems={[]} settings={{} as any} />);

    expect(screen.getByRole('heading', { name: /generated problems/i })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('results.noProblems');
    expect(screen.getByLabelText('accessibility.problemsList')).toHaveAttribute('tabindex', '0');
  });

  test('renders problems list', () => {
    const problems = [
      { id: 1, text: '1 + 2 = ' },
      { id: 2, text: '3 + 4 = ' },
    ];
    render(<ProblemsSection t={t} problems={problems as any} settings={{} as any} />);

    expect(screen.getByRole('heading', { name: /generated problems \(2\)/i })).toBeInTheDocument();
    const items = screen.getAllByText(/=\s*$/);
    expect(items.length).toBe(2);
  });
});
