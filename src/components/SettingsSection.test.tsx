import { fireEvent, render, screen } from '../../tests/helpers/testUtils';
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
  default: ({ id, onChange }: any) => (
    <input
      data-testid={id}
      onChange={_e => {
        // Simulate the RangeInput onChange behavior
        onChange([1, 2]);
      }}
    />
  ),
}));

describe.sequential('SettingsSection', () => {
  const t = (key: string, params?: Record<string, string | number>) => {
    if (key === 'settings.totalProblemsCalculated' && params) {
      return `Total: ${params.total}`;
    }
    return key;
  };
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
    paperSize: 'a4' as const,
    enableGrouping: false,
    problemsPerGroup: 20,
    totalGroups: 1,
  } as any;

  test('renders settings section with proper structure', () => {
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

    expect(screen.getByRole('region', { name: 'settings.title' })).toBeInTheDocument();
    expect(screen.getByLabelText('accessibility.selectOperations')).toBeInTheDocument();
    expect(screen.getByLabelText('accessibility.numProblemsInput')).toBeInTheDocument();
  });

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

  test('handles grouping toggle', () => {
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

    const groupingCheckbox = screen.getByLabelText('accessibility.enableGroupingLabel');
    fireEvent.click(groupingCheckbox);
    expect(onChange).toHaveBeenCalledWith('enableGrouping', true);
  });

  test('renders grouping fields when grouping is enabled', () => {
    const onChange = vi.fn();
    const onApplyPreset = vi.fn();
    const settingsWithGrouping = { ...baseSettings, enableGrouping: true };

    render(
      <SettingsSection
        t={t}
        settings={settingsWithGrouping}
        onChange={onChange}
        onApplyPreset={onApplyPreset}
        paperSizeOptions={{ a4: 'A4' }}
      />
    );

    expect(screen.getByLabelText('accessibility.problemsPerGroupInput')).toBeInTheDocument();
    expect(screen.getByLabelText('accessibility.totalGroupsInput')).toBeInTheDocument();
    expect(screen.getByText('Total: 20')).toBeInTheDocument();
  });

  test('handles problems per group change', () => {
    const onChange = vi.fn();
    const onApplyPreset = vi.fn();
    const settingsWithGrouping = { ...baseSettings, enableGrouping: true };

    render(
      <SettingsSection
        t={t}
        settings={settingsWithGrouping}
        onChange={onChange}
        onApplyPreset={onApplyPreset}
        paperSizeOptions={{ a4: 'A4' }}
      />
    );

    const problemsPerGroupInput = screen.getByLabelText('accessibility.problemsPerGroupInput');
    fireEvent.change(problemsPerGroupInput, { target: { value: '25' } });
    expect(onChange).toHaveBeenCalledWith('problemsPerGroup', 25);
  });

  test('handles total groups change', () => {
    const onChange = vi.fn();
    const onApplyPreset = vi.fn();
    const settingsWithGrouping = { ...baseSettings, enableGrouping: true };

    render(
      <SettingsSection
        t={t}
        settings={settingsWithGrouping}
        onChange={onChange}
        onApplyPreset={onApplyPreset}
        paperSizeOptions={{ a4: 'A4' }}
      />
    );

    const totalGroupsInput = screen.getByLabelText('accessibility.totalGroupsInput');
    fireEvent.change(totalGroupsInput, { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledWith('totalGroups', 3);
  });

  test('renders all operation options', () => {
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

    const select = screen.getByLabelText('accessibility.selectOperations');
    expect(select).toBeInTheDocument();

    // Check that all operation options are present
    const options = select.querySelectorAll('option');
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveValue('+');
    expect(options[1]).toHaveValue('-');
    expect(options[2]).toHaveValue('*');
    expect(options[3]).toHaveValue('/');
  });

  test('renders range inputs with correct props', () => {
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

    // Check that RangeInput components are rendered
    expect(screen.getByTestId('numRange')).toBeInTheDocument();
    expect(screen.getByTestId('result-range')).toBeInTheDocument();
    expect(screen.getByTestId('operands-range')).toBeInTheDocument();
  });

  test('handles range input changes', () => {
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

    // Clear previous calls
    onChange.mockClear();

    // Trigger range input changes
    const numRangeInput = screen.getByTestId('numRange');
    fireEvent.change(numRangeInput, { target: { value: '5' } });
    expect(onChange).toHaveBeenCalledWith('numRange', [1, 2]);

    const resultRangeInput = screen.getByTestId('result-range');
    fireEvent.change(resultRangeInput, { target: { value: '10' } });
    expect(onChange).toHaveBeenCalledWith('resultRange', [1, 2]);

    const operandsRangeInput = screen.getByTestId('operands-range');
    fireEvent.change(operandsRangeInput, { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledWith('numOperandsRange', [1, 2]);
  });

  test('renders child components', () => {
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

    expect(screen.getByTestId('apply-preset')).toBeInTheDocument();
    expect(screen.getByTestId('pdf-settings')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings')).toBeInTheDocument();
  });

  test('applies correct CSS classes based on grouping state', () => {
    const onChange = vi.fn();
    const onApplyPreset = vi.fn();

    const { rerender } = render(
      <SettingsSection
        t={t}
        settings={baseSettings}
        onChange={onChange}
        onApplyPreset={onApplyPreset}
        paperSizeOptions={{ a4: 'A4' }}
      />
    );

    // Check disabled state
    expect(document.querySelector('.grouping-disabled')).toBeInTheDocument();
    expect(document.querySelector('.collapsed')).toBeInTheDocument();

    // Enable grouping and rerender
    const settingsWithGrouping = { ...baseSettings, enableGrouping: true };
    rerender(
      <SettingsSection
        t={t}
        settings={settingsWithGrouping}
        onChange={onChange}
        onApplyPreset={onApplyPreset}
        paperSizeOptions={{ a4: 'A4' }}
      />
    );

    // Check enabled state
    expect(document.querySelector('.grouping-enabled')).toBeInTheDocument();
    expect(document.querySelector('.expanded')).toBeInTheDocument();
  });
});
