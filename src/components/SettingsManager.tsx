import React, { ChangeEvent, useRef } from 'react';
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

interface SettingsManagerProps {
  settings: Settings;
  onImportSettings: (settings: Settings) => void;
}

type TFunc = (key: string, params?: Record<string, string | number>) => string;

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
  onImportSettings: (settings: Settings) => void
): void => {
  try {
    const importedData = parseSettingsFile(rawContent);
    onImportSettings(importedData.settings);
  } catch (error) {
    const message = t('settings.importError') || 'Error importing settings file';
    alert(message);
    if (!(error instanceof SettingsParseError)) {
      console.error('Settings import error:', JSON.stringify(error));
    }
  }
};

const importSettingsFromFile = (
  file: File,
  t: TFunc,
  onImportSettings: (settings: Settings) => void
): void => {
  const reader = new FileReader();
  reader.onload = (event: ProgressEvent<FileReader>) => {
    const result = event.target?.result;
    if (typeof result !== 'string') {
      alert(t('settings.importError') || 'Invalid settings file format');
      return;
    }
    handleImportedContent(result, t, onImportSettings);
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

  const exportSettings = (): void => exportSettingsToFile(settings);

  const importSettings = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) {
      event.target.value = '';
      return;
    }
    importSettingsFromFile(file, t, onImportSettings);

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
          📤 {t('settings.manager.export') || 'Export Settings'}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className='import-button'
          aria-label={t('settings.manager.importLabel') || 'Import settings from file'}
        >
          📥 {t('settings.manager.import') || 'Import Settings'}
        </button>

        <input
          ref={fileInputRef}
          type='file'
          accept='.json'
          onChange={importSettings}
          className='visually-hidden'
        />
      </div>
    </div>
  );
};

export default SettingsManager;
