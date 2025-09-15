import type { Settings } from '@/types';
import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '../../tests/helpers/testUtils';
import { useSettings } from './useSettings';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads default settings when none are saved', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.operations).toEqual(['+', '-']);
  });

  it('auto-saves settings to localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const { result } = renderHook(() => useSettings());
    const newSettings: Settings = {
      ...result.current.settings,
      numProblems: 10,
    };
    act(() => {
      result.current.setSettings(newSettings);
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'mathgenie-settings',
      JSON.stringify(newSettings)
    );
  });

  it('validates settings', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const { result } = renderHook(() => useSettings());
    expect(result.current.validateSettings({ ...result.current.settings, operations: [] })).toEqual(
      'errors.noOperations'
    );
    expect(result.current.validateSettings({ ...result.current.settings, numProblems: 0 })).toEqual(
      'errors.invalidProblemCount'
    );
    expect(
      result.current.validateSettings({ ...result.current.settings, numRange: [5, 1] })
    ).toEqual('errors.invalidNumberRange');
    expect(
      result.current.validateSettings({ ...result.current.settings, resultRange: [5, 1] })
    ).toEqual('errors.invalidResultRange');
    expect(
      result.current.validateSettings({ ...result.current.settings, numOperandsRange: [5, 2] })
    ).toEqual('errors.invalidOperandsRange');
  });

  it('loads saved settings from storage', () => {
    const saved: Settings = {
      operations: ['*'],
      numProblems: 5,
      numRange: [2, 3],
      resultRange: [0, 20],
      numOperandsRange: [2, 2],
      allowNegative: true,
      showAnswers: true,
      fontSize: 18,
      lineSpacing: 14,
      paperSize: 'letter',
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(saved));
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings).toMatchObject(saved);
  });

  it('clears corrupted settings from storage', () => {
    localStorageMock.getItem.mockReturnValue('not-json');
    const { result } = renderHook(() => useSettings());
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('mathgenie-settings');
    expect(result.current.settings.operations).toEqual(['+', '-']);
  });
});
