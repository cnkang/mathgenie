import React, { ChangeEvent, useCallback, useRef, useState } from 'react';
import { useTranslation } from '../i18n';
import type { Settings } from '../types';
import {
  createDownloadBlob,
  createSettingsData,
  generateFilename,
  parseSettingsFile,
  serializeSettings,
  SettingsParseError,
} from '../utils/settingsManager';
import './SettingsManager.css';

interface SettingsManagerProps {
  settings: Settings;
  onImportSettings: (settings: Settings) => void;
}

type TFunc = (key: string, params?: Record<string, string | number>) => string;
type ImportErrorReporter = (message: string) => void;

const ExportIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' width='18' height='18' fill='none' aria-hidden='true'>
    <path
      d='M12 3v10m0 0 4-4m-4 4-4-4M4 19h16'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const ImportIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' width='18' height='18' fill='none' aria-hidden='true'>
    <path
      d='M12 21V11m0 0 4 4m-4-4-4 4M4 5h16'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const exportSettingsToFile = (settings: Settings): void => {
  const settingsData = createSettingsData(settings);
  const dataStr = serializeSettings(settingsData);
  const dataBlob = createDownloadBlob(dataStr);

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = generateFilename();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const handleImportedContent = (
  rawContent: string,
  t: TFunc,
  onImportSettings: (settings: Settings) => void,
  onImportError: ImportErrorReporter
): void => {
  try {
    const importedData = parseSettingsFile(rawContent);
    onImportSettings(importedData.settings);
  } catch (error) {
    const message = t('settings.importError') || 'Error importing settings file';
    onImportError(message);
    if (!(error instanceof SettingsParseError)) {
      console.error('Settings import error:', JSON.stringify(error));
    }
  }
};

const importSettingsFromFile = (
  file: File,
  t: TFunc,
  onImportSettings: (settings: Settings) => void,
  onImportError: ImportErrorReporter
): void => {
  const reader = new FileReader();
  reader.onload = (event: ProgressEvent<FileReader>) => {
    const result = event.target?.result;
    if (typeof result !== 'string') {
      onImportError(t('settings.importError') || 'Invalid settings file format');
      return;
    }
    handleImportedContent(result, t, onImportSettings, onImportError);
  };
  reader.readAsText(file);
};

/**
 * Settings Manager Component
 * Allows users to export and import their settings
 */
const SettingsManager: React.FC<SettingsManagerProps> = ({ settings, onImportSettings }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState('');

  const exportSettings = (): void => exportSettingsToFile(settings);

  const showImportError = useCallback((message: string): void => {
    setImportError(message);
  }, []);

  const clearImportError = useCallback((): void => {
    setImportError('');
  }, []);

  const importSettings = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) {
      event.target.value = '';
      return;
    }
    clearImportError();
    importSettingsFromFile(file, t, onImportSettings, showImportError);

    // Reset file input
    event.target.value = '';
  };

  return (
    <div className='settings-manager'>
      <h3>{t('settings.manager.title') || 'Settings Manager'}</h3>
      <div className='settings-actions'>
        <button
          onClick={exportSettings}
          className='export-button'
          aria-label={t('settings.manager.exportLabel') || 'Export current settings'}
        >
          <span className='settings-button-icon' aria-hidden='true'>
            <ExportIcon />
          </span>
          {t('settings.manager.export') || 'Export Settings'}
        </button>

        <button
          onClick={() => {
            clearImportError();
            fileInputRef.current?.click();
          }}
          className='import-button'
          aria-label={t('settings.manager.importLabel') || 'Import settings from file'}
        >
          <span className='settings-button-icon' aria-hidden='true'>
            <ImportIcon />
          </span>
          {t('settings.manager.import') || 'Import Settings'}
        </button>

        <input
          ref={fileInputRef}
          type='file'
          accept='.json'
          onChange={importSettings}
          className='visually-hidden'
        />
      </div>
      {importError && (
        <p className='settings-manager-alert' role='alert' aria-live='assertive' aria-atomic='true'>
          {importError}
        </p>
      )}
    </div>
  );
};

export default SettingsManager;
