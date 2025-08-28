import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '../i18n';
import SettingsPresets from './SettingsPresets';

describe('SettingsPresets', () => {
  const mockOnApplyPreset = vi.fn();

  beforeEach(() => {
    mockOnApplyPreset.mockClear();
  });

  test('renders preset cards', () => {
    render(
      <I18nProvider>
        <SettingsPresets onApplyPreset={mockOnApplyPreset} />
      </I18nProvider>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4); // 4 preset buttons
  });

  test('applies beginner preset when clicked', () => {
    render(
      <I18nProvider>
        <SettingsPresets onApplyPreset={mockOnApplyPreset} />
      </I18nProvider>
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // First button is beginner

    expect(mockOnApplyPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        operations: ['+', '-'],
        numProblems: 15,
        numRange: [1, 10]
      })
    );
  });

  test('applies intermediate preset when clicked', () => {
    render(
      <I18nProvider>
        <SettingsPresets onApplyPreset={mockOnApplyPreset} />
      </I18nProvider>
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // Second button is intermediate

    expect(mockOnApplyPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        operations: ['+', '-', '*'],
        numProblems: 20,
        numRange: [1, 50]
      })
    );
  });

  test('applies advanced preset when clicked', () => {
    render(
      <I18nProvider>
        <SettingsPresets onApplyPreset={mockOnApplyPreset} />
      </I18nProvider>
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[2]); // Third button is advanced

    expect(mockOnApplyPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        operations: ['+', '-', '*', '/'],
        numProblems: 25,
        numRange: [1, 100]
      })
    );
  });
});