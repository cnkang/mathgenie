import { describe, expect, it } from 'vitest';
import type { Settings } from '../types';
import {
  SettingsParseError,
  createDownloadBlob,
  createSettingsData,
  generateFilename,
  parseSettingsFile,
  serializeSettings,
  validateSettingsData,
} from './settingsManager';

describe('Settings Manager Utils', () => {
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
    enableGrouping: false,
    problemsPerGroup: 20,
    totalGroups: 1,
  };

  it('creates settings data with correct structure', () => {
    const result = createSettingsData(mockSettings);

    expect(result.version).toBe('1.0');
    expect(result.settings).toEqual(mockSettings);
    expect(result.timestamp).toBeDefined();
    expect(new Date(result.timestamp)).toBeInstanceOf(Date);
  });

  it('generates filename with correct format', () => {
    const testDate = new Date('2023-01-01T12:00:00.000Z');
    const filename = generateFilename(testDate);

    expect(filename).toBe('mathgenie-settings-2023-01-01.json');
  });

  it('generates filename with current date when no date provided', () => {
    const filename = generateFilename();

    expect(filename).toMatch(/^mathgenie-settings-\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('serializes settings data to JSON string', () => {
    const settingsData = createSettingsData(mockSettings);
    const serialized = serializeSettings(settingsData);

    expect(typeof serialized).toBe('string');
    expect(serialized).toContain('"version": "1.0"');
    expect(serialized).toContain('"operations"');
  });

  it('parses settings file content', () => {
    const settingsData = createSettingsData(mockSettings);
    const serialized = serializeSettings(settingsData);
    const parsed = parseSettingsFile(serialized);

    expect(parsed).toEqual(settingsData);
  });

  it('throws SettingsParseError for invalid JSON', () => {
    expect(() => parseSettingsFile('invalid json')).toThrow(SettingsParseError);
    expect(() => parseSettingsFile('invalid json')).toThrow(
      'Settings file contains invalid JSON syntax'
    );
  });

  it('throws SettingsParseError for invalid structure', () => {
    const invalid = JSON.stringify({ version: '1.0' });
    expect(() => parseSettingsFile(invalid)).toThrow(SettingsParseError);
    expect(() => parseSettingsFile(invalid)).toThrow('Settings file structure is invalid');
  });

  it('validates correct settings data', () => {
    const validData = createSettingsData(mockSettings);

    expect(validateSettingsData(validData)).toBe(true);
  });

  it('rejects invalid settings data', () => {
    expect(validateSettingsData(null)).toBe(false);
    expect(validateSettingsData(undefined)).toBe(false);
    expect(validateSettingsData({})).toBe(false);
    expect(validateSettingsData({ version: '1.0' })).toBe(false);
    expect(validateSettingsData({ settings: null })).toBe(false);
  });

  it('creates download blob with correct type', () => {
    const data = '{"test": "data"}';
    const blob = createDownloadBlob(data);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/json');
    expect(blob.size).toBe(data.length);
  });
});
