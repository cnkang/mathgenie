import type { Settings } from '../types';

export interface SettingsData {
  version: string;
  timestamp: string;
  settings: Settings;
}

export const createSettingsData = (settings: Settings): SettingsData => ({
  version: '1.0',
  timestamp: new Date().toISOString(),
  settings,
});

export const generateFilename = (date: Date = new Date()): string =>
  `mathgenie-settings-${date.toISOString().slice(0, 10)}.json`;

export const serializeSettings = (settingsData: SettingsData): string =>
  JSON.stringify(settingsData, null, 2);

export class SettingsParseError extends Error {
  constructor(message = 'Invalid settings file format') {
    super(message);
    this.name = 'SettingsParseError';
  }
}

const isValidObject = (data: unknown): data is Record<string, unknown> => {
  return data !== null && typeof data === 'object';
};

const hasSettingsProperty = (data: Record<string, unknown>): boolean => {
  return 'settings' in data;
};

const hasValidSettingsObject = (data: Record<string, unknown>): boolean => {
  return typeof data.settings === 'object' && data.settings !== null;
};

export const validateSettingsData = (data: unknown): data is SettingsData => {
  if (!isValidObject(data)) {
    return false;
  }

  if (!hasSettingsProperty(data)) {
    return false;
  }

  return hasValidSettingsObject(data);
};

export const parseSettingsFile = (content: string): SettingsData => {
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    throw new SettingsParseError('Settings file contains invalid JSON syntax');
  }

  if (!validateSettingsData(data)) {
    throw new SettingsParseError('Settings file structure is invalid');
  }

  return data;
};

export const createDownloadBlob = (data: string): Blob =>
  new Blob([data], { type: 'application/json' });
