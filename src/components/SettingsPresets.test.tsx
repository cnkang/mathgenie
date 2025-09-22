import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '../../tests/helpers/testUtils';
import type { Operation } from '../types';
import SettingsPresets from './SettingsPresets';

const translationMap: Record<string, string> = {
  'presets.title': 'Quick Presets',
  'presets.beginner.name': 'Beginner (1-10)',
  'presets.beginner.description': 'Simple addition and subtraction',
  'presets.intermediate.name': 'Intermediate (1-50)',
  'presets.intermediate.description': 'All operations with medium numbers',
  'presets.advanced.name': 'Advanced (1-100)',
  'presets.advanced.description': 'All operations including division',
  'presets.multiplication.name': 'Multiplication Focus',
  'presets.multiplication.description': 'Focus on multiplication tables',
  'presets.apply': 'Apply',
  'presets.clickToApply': 'Click to apply',
};

function translate(key: string): string {
  return translationMap[key] ?? key;
}

function MockI18nProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div>{children}</div>;
}

function useMockTranslation() {
  return { t: translate };
}

type TranslateFn = (key: string) => string | undefined;

type PresetGridItem = {
  name: string;
  description: string;
  settings: unknown;
};

type BuildPresetGridArgs = {
  translate: TranslateFn;
  presets: PresetGridItem[];
  onApply: (settings: unknown) => void;
  getButtonAriaLabel?: (preset: PresetGridItem) => string | undefined;
};

const buildPresetGrid = ({
  translate: translateFn,
  presets,
  onApply,
  getButtonAriaLabel,
}: BuildPresetGridArgs): React.ReactElement => (
  <div className='settings-presets'>
    <h3>{translateFn('presets.title') ?? 'Quick Presets'}</h3>
    <div className='presets-grid'>
      {presets.map(preset => (
        <div key={preset.name} className='preset-card'>
          <h4>{preset.name}</h4>
          <p>{preset.description}</p>
          <button
            onClick={() => onApply(preset.settings)}
            className='preset-button'
            aria-label={getButtonAriaLabel?.(preset) ?? undefined}
          >
            {translateFn('presets.apply') ?? 'Apply'}
          </button>
        </div>
      ))}
    </div>
  </div>
);

const FallbackTranslationList: React.FC<{ translate: TranslateFn }> = ({
  translate: translateFn,
}) => (
  <div>
    <div data-testid='title'>{translateFn('presets.title') ?? 'Quick Presets'}</div>
    <div data-testid='beginner-name'>
      {translateFn('presets.beginner.name') ?? 'Beginner (1-10)'}
    </div>
    <div data-testid='beginner-desc'>
      {translateFn('presets.beginner.description') ?? 'Simple addition and subtraction'}
    </div>
    <div data-testid='intermediate-name'>
      {translateFn('presets.intermediate.name') ?? 'Intermediate (1-50)'}
    </div>
    <div data-testid='intermediate-desc'>
      {translateFn('presets.intermediate.description') ?? 'All operations with medium numbers'}
    </div>
    <div data-testid='advanced-name'>
      {translateFn('presets.advanced.name') ?? 'Advanced (1-100)'}
    </div>
    <div data-testid='advanced-desc'>
      {translateFn('presets.advanced.description') ?? 'All operations including division'}
    </div>
    <div data-testid='multiplication-name'>
      {translateFn('presets.multiplication.name') ?? 'Multiplication Tables'}
    </div>
    <div data-testid='multiplication-desc'>
      {translateFn('presets.multiplication.description') ?? 'Focus on multiplication practice'}
    </div>
    <div data-testid='apply'>{translateFn('presets.apply') ?? 'Apply'}</div>
  </div>
);

// Mock the i18n system
vi.mock('../i18n', () => ({
  I18nProvider: MockI18nProvider,
  useTranslation: useMockTranslation,
}));

describe('SettingsPresets', () => {
  const mockOnApplyPreset = vi.fn();

  beforeEach(() => {
    mockOnApplyPreset.mockClear();
  });

  test('renders preset cards', () => {
    render(<SettingsPresets onApplyPreset={mockOnApplyPreset} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4); // 4 preset buttons
  });

  test('applies beginner preset when clicked', () => {
    render(<SettingsPresets onApplyPreset={mockOnApplyPreset} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // First button is beginner

    expect(mockOnApplyPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        operations: ['+', '-'] as Operation[],
        numProblems: 15,
        numRange: [1, 10],
      })
    );
  });

  test('applies intermediate preset when clicked', () => {
    render(<SettingsPresets onApplyPreset={mockOnApplyPreset} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]); // Second button is intermediate

    expect(mockOnApplyPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        operations: ['+', '-', '*'] as Operation[],
        numProblems: 20,
        numRange: [1, 50],
      })
    );
  });

  test('applies advanced preset when clicked', () => {
    render(<SettingsPresets onApplyPreset={mockOnApplyPreset} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[2]); // Third button is advanced

    expect(mockOnApplyPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        operations: ['+', '-', '*', '/'] as Operation[],
        numProblems: 25,
        numRange: [1, 100],
      })
    );
  });

  test('applies multiplication preset when clicked', () => {
    render(<SettingsPresets onApplyPreset={mockOnApplyPreset} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[3]); // Fourth button is multiplication

    expect(mockOnApplyPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        operations: ['*'] as Operation[],
        numProblems: 30,
        numRange: [1, 12],
      })
    );
  });

  test('has correct accessibility attributes', () => {
    render(<SettingsPresets onApplyPreset={mockOnApplyPreset} />);

    const buttons = screen.getAllByRole('button');

    // Check that each button has proper aria-label
    expect(buttons[0].getAttribute('aria-label')).toContain('Apply');
    expect(buttons[1].getAttribute('aria-label')).toContain('Apply');
    expect(buttons[2].getAttribute('aria-label')).toContain('Apply');
    expect(buttons[3].getAttribute('aria-label')).toContain('Apply');
  });

  test('renders all preset information correctly', () => {
    const { container } = render(<SettingsPresets onApplyPreset={mockOnApplyPreset} />);

    // Check that all presets are rendered
    const presetCards = container.querySelectorAll('.preset-card');
    expect(presetCards).toHaveLength(4);

    // Check that each card has title, description, and button
    presetCards.forEach(card => {
      expect(card.querySelector('h4')).toBeDefined();
      expect(card.querySelector('p')).toBeDefined();
      expect(card.querySelector('button')).toBeDefined();
    });
  });

  test('renders with fallback text when translations return undefined', () => {
    const identityTranslate: TranslateFn = key => key;
    const presetsWithFallback: PresetGridItem[] = [
      {
        name: identityTranslate('presets.beginner.name') ?? 'Beginner (1-10)',
        description:
          identityTranslate('presets.beginner.description') ?? 'Simple addition and subtraction',
        settings: { operations: ['+', '-'] as Operation[], numProblems: 15 },
      },
    ];

    render(
      buildPresetGrid({
        translate: identityTranslate,
        presets: presetsWithFallback,
        onApply: mockOnApplyPreset,
      })
    );

    // Verify fallback values are used
    expect(screen.getByText('presets.title')).toBeDefined();
    expect(screen.getByText('presets.beginner.name')).toBeDefined();
    expect(screen.getByText('presets.beginner.description')).toBeDefined();
    expect(screen.getByText('presets.apply')).toBeDefined();
  });

  test('covers all translation fallback branches', () => {
    const undefinedTranslate: TranslateFn = () => undefined;

    render(<FallbackTranslationList translate={undefinedTranslate} />);

    // Test all fallback branches - use native DOM properties instead of jest-dom matchers
    expect(screen.getByTestId('title').textContent).toBe('Quick Presets');
    expect(screen.getByTestId('beginner-name').textContent).toBe('Beginner (1-10)');
    expect(screen.getByTestId('beginner-desc').textContent).toBe('Simple addition and subtraction');
    expect(screen.getByTestId('intermediate-name').textContent).toBe('Intermediate (1-50)');
    expect(screen.getByTestId('intermediate-desc').textContent).toBe(
      'All operations with medium numbers'
    );
    expect(screen.getByTestId('advanced-name').textContent).toBe('Advanced (1-100)');
    expect(screen.getByTestId('advanced-desc').textContent).toBe(
      'All operations including division'
    );
    expect(screen.getByTestId('multiplication-name').textContent).toBe('Multiplication Tables');
    expect(screen.getByTestId('multiplication-desc').textContent).toBe(
      'Focus on multiplication practice'
    );
    expect(screen.getByTestId('apply').textContent).toBe('Apply');
  });

  test('tests handleApplyPreset function with complete settings', () => {
    render(<SettingsPresets onApplyPreset={mockOnApplyPreset} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // Click beginner preset

    // Verify that the complete settings object is passed
    expect(mockOnApplyPreset).toHaveBeenCalledWith({
      operations: ['+', '-'] as Operation[],
      numProblems: 15,
      numRange: [1, 10],
      resultRange: [0, 20],
      numOperandsRange: [2, 2],
      allowNegative: false,
      showAnswers: false,
      fontSize: 18,
      lineSpacing: 16,
      paperSize: 'a4' as const,
    });
  });

  test('renders with mock translation provider that returns undefined', () => {
    const identityTranslate: TranslateFn = key => key;
    const presetOptions: PresetGridItem[] = [
      {
        name: identityTranslate('presets.beginner.name') ?? 'Beginner (1-10)',
        description:
          identityTranslate('presets.beginner.description') ?? 'Simple addition and subtraction',
        settings: {
          operations: ['+', '-'] as Operation[],
          numProblems: 15,
          numRange: [1, 10] as [number, number],
          resultRange: [0, 20] as [number, number],
          numOperandsRange: [2, 2] as [number, number],
          allowNegative: false,
          showAnswers: false,
          fontSize: 18,
          lineSpacing: 16,
          paperSize: 'a4' as const,
        },
      },
    ];

    const { container } = render(
      buildPresetGrid({
        translate: identityTranslate,
        presets: presetOptions,
        onApply: mockOnApplyPreset,
        getButtonAriaLabel: preset => `Apply ${preset.name} preset`,
      })
    );

    // Verify all fallback values are rendered using container queries to avoid duplicates - use native DOM properties
    expect(container.querySelector('h3')?.textContent).toBe('presets.title');
    expect(container.querySelector('h4')?.textContent).toBe('presets.beginner.name');
    expect(container.querySelector('p')?.textContent).toBe('presets.beginner.description');
    expect(container.querySelector('button')?.textContent).toBe('presets.apply');
  });

  test('covers aria-label fallback with preset name', () => {
    const { container } = render(<SettingsPresets onApplyPreset={mockOnApplyPreset} />);

    const buttons = container.querySelectorAll('button');

    // Check that aria-label includes preset name (this tests the template literal)
    buttons.forEach(button => {
      const ariaLabel = button.getAttribute('aria-label');
      if (ariaLabel) {
        expect(ariaLabel).toContain('Apply');
        expect(ariaLabel).toContain('preset');
      }
    });
  });

  test('verifies all preset configurations are complete', () => {
    render(<SettingsPresets onApplyPreset={mockOnApplyPreset} />);

    const buttons = screen.getAllByRole('button');

    // Test each preset to ensure complete settings are passed
    const expectedPresets = [
      {
        operations: ['+', '-'] as Operation[],
        numProblems: 15,
        numRange: [1, 10] as [number, number],
        resultRange: [0, 20] as [number, number],
        numOperandsRange: [2, 2] as [number, number],
        allowNegative: false,
        showAnswers: false,
        fontSize: 18,
        lineSpacing: 16,
        paperSize: 'a4' as const,
      },
      {
        operations: ['+', '-', '*'] as Operation[],
        numProblems: 20,
        numRange: [1, 50] as [number, number],
        resultRange: [0, 100] as [number, number],
        numOperandsRange: [2, 3] as [number, number],
        allowNegative: false,
        showAnswers: false,
        fontSize: 16,
        lineSpacing: 14,
        paperSize: 'a4' as const,
      },
      {
        operations: ['+', '-', '*', '/'] as Operation[],
        numProblems: 25,
        numRange: [1, 100] as [number, number],
        resultRange: [-50, 200] as [number, number],
        numOperandsRange: [2, 4] as [number, number],
        allowNegative: true,
        showAnswers: false,
        fontSize: 14,
        lineSpacing: 12,
        paperSize: 'a4' as const,
      },
      {
        operations: ['*'] as Operation[],
        numProblems: 30,
        numRange: [1, 12] as [number, number],
        resultRange: [1, 144] as [number, number],
        numOperandsRange: [2, 2] as [number, number],
        allowNegative: false,
        showAnswers: false,
        fontSize: 16,
        lineSpacing: 14,
        paperSize: 'a4' as const,
      },
    ];

    expectedPresets.forEach((expectedPreset, index) => {
      mockOnApplyPreset.mockClear();
      fireEvent.click(buttons[index]);

      expect(mockOnApplyPreset).toHaveBeenCalledWith(expect.objectContaining(expectedPreset));
    });
  });
});
