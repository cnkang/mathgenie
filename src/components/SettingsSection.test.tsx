import React from 'react';
import { render, screen, fireEvent } from '../../tests/helpers/testUtils';
import SettingsSection from './SettingsSection';

// Stub child components to focus coverage on this module
vi.mock('./SettingsPresets', () => ({
  __esModule: true,
  default: ({ onApplyPreset }: any) => (
    <button data-testid='apply-preset' onClick={() => onApplyPreset({} as any)}>
      Presets
    </button>
  ),
}));

vi.mock('./settings/PdfSettings', () => ({
  __esModule: true,
  default: () => <div data-testid='pdf-settings' />,
}));

vi.mock('./settings/AdvancedSettings', () => ({
  __esModule: true,
  default: () => <div data-testid='advanced-settings' />,
}));

vi.mock('./form/RangeInput', () => ({
  __esModule: true,
  default: ({ id, onChange }: any) => <input data-testid={id} onChange={() => onChange([1, 2])} />,
}));

describe.sequential('SettingsSection', () => {
  const t = (key: string) => key;
  const baseSettings = {
    operations: ['+'],
    numProblems: 10,
    numRange: [1, 10],
    resultRange: [1, 20],
    numOperandsRange: [2, 3],
    allowNegative: false,
    showAnswers: false,
    fontSize: 12,
    lineSpacing: 10,
    paperSize: 'a4',
  } as any;

  test('changes numProblems and operations', () => {
    const onChange = vi.fn();
    const onApplyPreset = vi.fn();
    render(
      <SettingsSection
        t={t}
        settings={baseSettings}
        onChange={onChange}
        onApplyPreset={onApplyPreset}
        paperSizeOptions={{ a4: 'A4' }}
      />
    );

    const numInput = screen.getByLabelText('accessibility.numProblemsInput') as HTMLInputElement;
    fireEvent.change(numInput, { target: { value: '20' } });
    expect(onChange).toHaveBeenCalledWith('numProblems', 20);

    const select = screen.getByLabelText('accessibility.selectOperations') as HTMLSelectElement;
    const optPlus = document.createElement('option');
    optPlus.value = '+';
    optPlus.selected = true;
    const optMinus = document.createElement('option');
    optMinus.value = '-';
    optMinus.selected = true;
    select.append(optPlus, optMinus);
    // Simulate change event with selectedOptions
    Object.defineProperty(select, 'selectedOptions', {
      value: [optPlus, optMinus],
    });
    fireEvent.change(select);
    expect(onChange).toHaveBeenCalledWith('operations', ['+', '-']);
  });
});
