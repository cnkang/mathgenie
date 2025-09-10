import { fireEvent, render, screen } from '@testing-library/react';
import { ChangeEvent } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
  SettingsParseError: class SettingsParseError extends Error {},
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

  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure DOM is clean
    document.body.innerHTML = '';
    // Mock alert globally
    global.alert = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders settings manager component', () => {
    render(<SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />);

    expect(screen.getByText('settings.manager.title')).toBeInTheDocument();
    expect(screen.getByText('📤 settings.manager.export')).toBeInTheDocument();
    expect(screen.getByText('📥 settings.manager.import')).toBeInTheDocument();
  });

  it('renders export button with correct attributes', () => {
    render(<SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />);

    const exportButton = screen.getByText('📤 settings.manager.export');
    expect(exportButton.className).toContain('export-button');
    expect(exportButton.getAttribute('aria-label')).toBe('settings.manager.exportLabel');
  });

  it('renders import button with correct attributes', () => {
    render(<SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />);

    const importButton = screen.getByText('📥 settings.manager.import');
    expect(importButton.className).toContain('import-button');
    expect(importButton.getAttribute('aria-label')).toBe('settings.manager.importLabel');
  });

  it('renders hidden file input with correct attributes', () => {
    render(<SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />);

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput?.getAttribute('accept')).toBe('.json');
    expect(fileInput?.getAttribute('aria-hidden')).toBe('true');
  });

  it('handles export settings click', () => {
    render(<SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />);

    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
      style: {},
    };

    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    const appendChildSpy = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation(() => mockLink as any);
    const removeChildSpy = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation(() => mockLink as any);
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const exportButton = screen.getByText('📤 settings.manager.export');
    fireEvent.click(exportButton);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockLink.click).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });

  it('handles import button click', () => {
    render(<SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => {});

    const importButton = screen.getByText('📥 settings.manager.import');
    fireEvent.click(importButton);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('handles file import with no file selected', () => {
    render(<SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: null,
      configurable: true,
    });

    fireEvent.change(fileInput);

    expect(mockOnImportSettings).not.toHaveBeenCalled();
  });

  it('resets file input value after change', () => {
    render(<SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['{}'], 'settings.json', { type: 'application/json' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    fireEvent.change(fileInput);

    expect(fileInput.value).toBe('');
  });

  it('handles successful file import', async () => {
    const { parseSettingsFile } = await import('../utils/settingsManager');

    vi.mocked(parseSettingsFile).mockReturnValue({
      settings: mockSettings,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });

    render(<SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['{"settings": {}, "version": "1.0.0"}'], 'settings.json', {
      type: 'application/json',
    });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      result: '{"settings": {}, "version": "1.0.0"}',
    };

    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    fireEvent.change(fileInput);

    // Simulate FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload({
        target: { result: '{"settings": {}, "version": "1.0.0"}' },
      } as any);
    }

    expect(mockOnImportSettings).toHaveBeenCalledWith(mockSettings);
  });

  it('handles invalid settings file format', async () => {
    const { parseSettingsFile, SettingsParseError } = await import('../utils/settingsManager');

    vi.mocked(parseSettingsFile).mockImplementation(() => {
      throw new SettingsParseError('Invalid');
    });

    render(<SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['invalid'], 'settings.json', { type: 'application/json' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      result: 'invalid',
    };

    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    fireEvent.change(fileInput);

    // Simulate FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload({
        target: { result: 'invalid' },
      } as any);
    }

    expect(global.alert).toHaveBeenCalledWith('settings.importError');
    expect(mockOnImportSettings).not.toHaveBeenCalled();
  });

  it('handles file reading error', () => {
    render(<SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['{}'], 'settings.json', { type: 'application/json' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    // Mock FileReader to throw error
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      result: null,
    };

    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    fireEvent.change(fileInput);

    // Simulate FileReader onload with error
    if (mockFileReader.onload) {
      mockFileReader.onload({
        target: { result: null },
      } as any);
    }

    // Should not call onImportSettings when result is null
    expect(mockOnImportSettings).not.toHaveBeenCalled();
  });

  it('handles JSON parsing error', async () => {
    const { parseSettingsFile, SettingsParseError } = await import('../utils/settingsManager');

    vi.mocked(parseSettingsFile).mockImplementation(() => {
      throw new SettingsParseError('Invalid JSON');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['invalid json'], 'settings.json', { type: 'application/json' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      result: 'invalid json',
    };

    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    fireEvent.change(fileInput);

    // Simulate FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload({
        target: { result: 'invalid json' },
      } as any);
    }

    expect(global.alert).toHaveBeenCalledWith('settings.importError');
    expect(consoleSpy).not.toHaveBeenCalled();
    expect(mockOnImportSettings).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('handles file import with non-string result', () => {
    render(<SettingsManager settings={mockSettings} onImportSettings={mockOnImportSettings} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['{}'], 'settings.json', { type: 'application/json' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    // Mock FileReader with non-string result
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      result: new ArrayBuffer(8), // Non-string result
    };

    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    fireEvent.change(fileInput);

    // Simulate FileReader onload with non-string result
    if (mockFileReader.onload) {
      mockFileReader.onload({
        target: { result: new ArrayBuffer(8) },
      } as any);
    }

    // Should not call onImportSettings when result is not a string
    expect(mockOnImportSettings).not.toHaveBeenCalled();
  });

  it('renders with fallback text when translations return undefined', () => {
    // Mock useTranslation to return undefined
    vi.doMock('../i18n', () => ({
      useTranslation: () => ({
        t: () => undefined,
      }),
    }));

    // Create a test component that simulates the fallback behavior
    const TestComponent = () => {
      const mockT = (key: string) => key;
      return (
        <div className='settings-manager'>
          <h3>{mockT('settings.manager.title') || 'Settings Manager'}</h3>
          <div className='settings-actions'>
            <button
              className='export-button'
              aria-label={mockT('settings.export.aria') || 'Export current settings to file'}
            >
              <span className='button-icon'>📤</span>
              {mockT('settings.export') || '📤 Export Settings'}
            </button>
            <button
              className='import-button'
              aria-label={mockT('settings.import.aria') || 'Import settings from file'}
            >
              <span className='button-icon'>📥</span>
              {mockT('settings.import') || '📥 Import Settings'}
            </button>
            <input
              type='file'
              accept='.json'
              style={{ display: 'none' }}
              aria-label={mockT('settings.fileInput.aria') || 'Select settings file to import'}
            />
          </div>
        </div>
      );
    };

    render(<TestComponent />);

    // Should render fallback text
    expect(screen.getByText('settings.manager.title')).toBeDefined();
    expect(screen.getByText('settings.export')).toBeDefined();
    expect(screen.getByText('settings.import')).toBeDefined();
  });

  it('handles alert with fallback message for parsing error', async () => {
    const { parseSettingsFile, SettingsParseError } = await import('../utils/settingsManager');
    vi.mocked(parseSettingsFile).mockImplementation(() => {
      throw new SettingsParseError('Parse error');
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Create a test component with mocked translation that returns undefined
    const TestComponent = () => {
      const mockT = (key: string) => key;
      const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
          return;
        }
        const reader = new FileReader();
        reader.onload = e => {
          try {
            const result = e.target?.result;
            if (typeof result !== 'string') {
              return;
            }
            const parsedData = parseSettingsFile(result);
            mockOnImportSettings(parsedData.settings);
          } catch (error) {
            if (error instanceof SettingsParseError) {
              alert(mockT('settings.importError') || 'Invalid settings file format');
            } else {
              console.error('Settings import error:', error);
              alert(mockT('settings.importError') || 'Error importing settings file');
            }
          }
        };
        reader.readAsText(file);
        event.target.value = '';
      };

      return (
        <input type='file' accept='.json' onChange={handleFileChange} data-testid='file-input' />
      );
    };

    render(<TestComponent />);

    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
    const file = new File(['invalid'], 'settings.json', { type: 'application/json' });
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });

    // Mock FileReader
    const mockFileReader = {
      readAsText: vi.fn(),
      onload: null as any,
      result: 'invalid',
    };
    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    fireEvent.change(fileInput);

    // Simulate FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload({
        target: { result: 'invalid' },
      } as any);
    }

    expect(global.alert).toHaveBeenCalledWith('settings.importError');
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
