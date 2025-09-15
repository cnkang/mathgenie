import React from 'react';
import { render, screen } from '../../tests/helpers/testUtils';
import AppHeader from './AppHeader';

vi.mock('./LanguageSelector', () => ({
  __esModule: true,
  default: () => <div data-testid='lang-selector' />,
}));

describe.sequential('AppHeader', () => {
  const t = (key: string) => (key === 'app.title' ? 'MathGenie' : key);

  test('renders title, subtitle and language selector', () => {
    render(<AppHeader t={t} />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /mathgenie/i })).toBeInTheDocument();
    expect(screen.getByText('app.subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('lang-selector')).toBeInTheDocument();
  });
});
