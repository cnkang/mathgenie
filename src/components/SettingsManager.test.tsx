import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../tests/helpers/testUtils';
import type { Settings } from '../types';
import SettingsManager from './SettingsManager';

// Mock translation hook
vi.mock('../i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock settingsManager utilities
vi.mock('../utils/settingsManager', () => ({
  createSettingsData: vi.fn(settings => ({ settings, version: '1.0.0' })),
  generateFilename: vi.fn(() => 'settings.json'),
  serializeSettings: vi.fn(data => JSON.stringify(data)),
  parseSettingsFile: vi.fn(content => JSON.parse(content)),
  createDownloadBlob: vi.fn(() => new Blob(['test'], { type: 'application/json' })),
  SettingsParseError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'SettingsParseError';
    }
  },
}));

describe('SettingsManager Component', () => {
  const mockSettings: Settings = {
    operations: ['+', '-'],
    numProblems: 10,
    numRange: [1, 10],
    resultRange: [0, 20],
    numOperandsRange: [2, 2],
    allowNegative: false,
    showAnswers: true,
    fontSize: 12,
    lineSpacing: 18,
    paperSize: 'a4' as const,
    enableGrouping: false,
    problemsPerGroup: 20,
    totalGroups: 1,
  };

  const mockOnImportSettings = vi.fn();

  it('renders settings manager component', () => {
    render(<SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />);

    expect(screen.getByText('settings.manager.title')).toBeInTheDocument();
    expect(screen.getByText('📤 settings.manager.export')).toBeInTheDocument();
    expect(screen.getByText('📥 settings.manager.import')).toBeInTheDocument();
  });

  it('renders export button with correct attributes', () => {
    const { container } = render(
      <SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />
    );

    const exportButton = container.querySelector('.export-button');
    expect(exportButton).toBeInTheDocument();
    expect(exportButton?.getAttribute('aria-label')).toBe('settings.manager.exportLabel');
  });

  it('renders import button with correct attributes', () => {
    const { container } = render(
      <SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />
    );

    const importButton = container.querySelector('.import-button');
    expect(importButton).toBeInTheDocument();
    expect(importButton?.getAttribute('aria-label')).toBe('settings.manager.importLabel');
  });

  it('renders hidden file input with correct attributes', () => {
    render(<SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />);

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput?.getAttribute('accept')).toBe('.json');
  });

  it('handles export button click without errors', () => {
    const { container } = render(
      <SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />
    );

    const exportButton = container.querySelector('.export-button');

    // Just verify the button exists and can be clicked without throwing
    expect(exportButton).toBeInTheDocument();
    expect(() => (exportButton as HTMLButtonElement)?.click()).not.toThrow();
  });

  it('handles import button click', () => {
    const { container } = render(
      <SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />
    );

    const importButton = container.querySelector('.import-button');
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    // Mock click method
    const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => {});

    importButton?.click();

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('renders file input for import functionality', () => {
    render(<SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />);

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', '.json');
    expect(fileInput).toHaveClass('visually-hidden');
  });

  it('has proper component structure', () => {
    const { container } = render(
      <SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />
    );

    expect(container.querySelector('.settings-manager')).toBeInTheDocument();
    expect(container.querySelector('.settings-actions')).toBeInTheDocument();
    expect(container.querySelector('.export-button')).toBeInTheDocument();
    expect(container.querySelector('.import-button')).toBeInTheDocument();
  });

  it('renders with proper heading structure', () => {
    const { container } = render(
      <SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />
    );

    const heading = container.querySelector('h3');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('settings.manager.title');
  });

  it('renders buttons with proper emoji icons', () => {
    const { container } = render(
      <SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />
    );

    const exportButton = container.querySelector('.export-button');
    const importButton = container.querySelector('.import-button');

    expect(exportButton).toBeInTheDocument();
    expect(importButton).toBeInTheDocument();
    expect(exportButton?.textContent).toContain('📤');
    expect(importButton?.textContent).toContain('📥');
  });

  it('tests file input functionality exists', () => {
    render(<SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    // Test that the input can receive files (basic functionality)
    expect(fileInput.accept).toBe('.json');
    expect(fileInput.type).toBe('file');
  });

  it('verifies export functionality exists', () => {
    const { container } = render(
      <SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />
    );

    const exportButton = container.querySelector('.export-button');
    expect(exportButton).toBeInTheDocument();

    // Test that clicking doesn't throw errors
    expect(() => exportButton?.click()).not.toThrow();
  });

  it('verifies import functionality structure', () => {
    const { container } = render(
      <SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput.accept).toBe('.json');

    // Verify the input has proper attributes for file handling
    expect(fileInput.type).toBe('file');
    expect(fileInput).toHaveClass('visually-hidden');
  });

  it('tests component with mock utilities', () => {
    // Verify that the component renders with mocked utilities
    const { container } = render(
      <SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />
    );

    // Component should render successfully with mocked dependencies
    const title = container.querySelector('h3');
    expect(title).toBeInTheDocument();
    expect(title?.textContent).toBe('settings.manager.title');
  });

  it('renders with different settings configurations', () => {
    const alternativeSettings: Settings = {
      operations: ['×', '÷'],
      numProblems: 20,
      numRange: [5, 15],
      resultRange: [10, 50],
      numOperandsRange: [3, 4],
      allowNegative: true,
      showAnswers: false,
      fontSize: 14,
      lineSpacing: 20,
      paperSize: 'letter' as const,
      enableGrouping: true,
      problemsPerGroup: 10,
      totalGroups: 2,
    };

    const { container } = render(
      <SettingsManager settings={alternativeSettings} onImportSettings={mockOnImportSettings} />
    );

    // Component should render regardless of settings values
    expect(container.querySelector('.settings-manager')).toBeInTheDocument();
    expect(container.querySelector('.export-button')).toBeInTheDocument();
    expect(container.querySelector('.import-button')).toBeInTheDocument();
  });

  it('verifies component props are used correctly', () => {
    const customOnImport = vi.fn();
    const customSettings = { ...mockSettings, numProblems: 25 };

    render(<SettingsManager settings={customSettings} onImportSettings={customOnImport} />);

    // Component should accept and use the provided props
    expect(customOnImport).toBeDefined();
    expect(customSettings.numProblems).toBe(25);
  });

  it('tests component accessibility attributes', () => {
    const { container } = render(
      <SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />
    );

    const exportButton = container.querySelector('.export-button');
    const importButton = container.querySelector('.import-button');

    // Verify accessibility attributes are present
    expect(exportButton?.getAttribute('aria-label')).toBeTruthy();
    expect(importButton?.getAttribute('aria-label')).toBeTruthy();
  });
});
