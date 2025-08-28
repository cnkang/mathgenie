import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SettingsManager from './SettingsManager';
import type { Settings } from '../types';

// Mock translation hook
vi.mock('../i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

// Mock settingsManager utilities
vi.mock('../utils/settingsManager', () => ({
  createSettingsData: vi.fn((settings) => ({ settings, version: '1.0.0' })),
  generateFilename: vi.fn(() => 'settings.json'),
  serializeSettings: vi.fn((data) => JSON.stringify(data)),
  parseSettingsFile: vi.fn((content) => JSON.parse(content)),
  validateSettingsData: vi.fn(() => true),
  createDownloadBlob: vi.fn(() => new Blob(['test'], { type: 'application/json' }))
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
    render(
      <SettingsManager 
        settings={mockSettings} 
        onImportSettings={mockOnImportSettings} 
      />
    );
    
    expect(screen.getByText('settings.manager.title')).toBeInTheDocument();
    expect(screen.getByText('📤 settings.manager.export')).toBeInTheDocument();
    expect(screen.getByText('📥 settings.manager.import')).toBeInTheDocument();
  });

  it('renders export button with correct attributes', () => {
    render(
      <SettingsManager 
        settings={mockSettings} 
        onImportSettings={mockOnImportSettings} 
      />
    );
    
    const exportButton = screen.getByText('📤 settings.manager.export');
    expect(exportButton.className).toContain('export-button');
    expect(exportButton.getAttribute('aria-label')).toBe('settings.manager.exportLabel');
  });

  it('renders import button with correct attributes', () => {
    render(
      <SettingsManager 
        settings={mockSettings} 
        onImportSettings={mockOnImportSettings} 
      />
    );
    
    const importButton = screen.getByText('📥 settings.manager.import');
    expect(importButton.className).toContain('import-button');
    expect(importButton.getAttribute('aria-label')).toBe('settings.manager.importLabel');
  });

  it('renders hidden file input with correct attributes', () => {
    render(
      <SettingsManager 
        settings={mockSettings} 
        onImportSettings={mockOnImportSettings} 
      />
    );
    
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput?.getAttribute('accept')).toBe('.json');
    expect(fileInput?.getAttribute('aria-hidden')).toBe('true');
  });

  it('handles export settings click', () => {
    render(
      <SettingsManager 
        settings={mockSettings} 
        onImportSettings={mockOnImportSettings} 
      />
    );
    
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
      style: {}
    };
    
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
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
    render(
      <SettingsManager 
        settings={mockSettings} 
        onImportSettings={mockOnImportSettings} 
      />
    );
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => {});
    
    const importButton = screen.getByText('📥 settings.manager.import');
    fireEvent.click(importButton);
    
    expect(clickSpy).toHaveBeenCalled();
  });

  it('handles file import with no file selected', () => {
    render(
      <SettingsManager 
        settings={mockSettings} 
        onImportSettings={mockOnImportSettings} 
      />
    );
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(fileInput, 'files', {
      value: null,
      configurable: true
    });
    
    fireEvent.change(fileInput);
    
    expect(mockOnImportSettings).not.toHaveBeenCalled();
  });

  it('resets file input value after change', () => {
    render(
      <SettingsManager 
        settings={mockSettings} 
        onImportSettings={mockOnImportSettings} 
      />
    );
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    const file = new File(['{}'], 'settings.json', { type: 'application/json' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true
    });
    
    fireEvent.change(fileInput);
    
    expect(fileInput.value).toBe('');
  });




});