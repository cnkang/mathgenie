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
    paperSize: 'a4',
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
});
