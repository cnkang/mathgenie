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

/**
 * Settings Manager Component
 * Allows users to export and import their settings
 */
const SettingsManager: React.FC<SettingsManagerProps> = ({ settings, onImportSettings }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportSettings = (): void => {
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

  const importSettings = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const importedData = parseSettingsFile(result);
          onImportSettings(importedData.settings);
        }
      } catch (error) {
        if (error instanceof SettingsParseError) {
          alert(t('settings.importError') || 'Invalid settings file format');
        } else {
          alert(t('settings.importError') || 'Error importing settings file');
          console.error('Settings import error:', error);
        }
      }
    };
    reader.readAsText(file);

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
