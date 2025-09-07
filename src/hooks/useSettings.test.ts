import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSettings } from './useSettings';
import type { Settings } from '@/types';

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

  it('saves settings to localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const { result } = renderHook(() => useSettings());
    const newSettings: Settings = {
      ...result.current.settings,
      numProblems: 10,
    };
    act(() => {
      result.current.setSettings(newSettings);
      result.current.saveSettings(newSettings);
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
      { key: 'errors.noOperations' }
    );
    expect(result.current.validateSettings({ ...result.current.settings, numProblems: 0 })).toEqual(
      { key: 'errors.invalidProblemCount' }
    );
    expect(
      result.current.validateSettings({ ...result.current.settings, numRange: [5, 1] })
    ).toEqual({ key: 'errors.invalidNumberRange' });
    expect(
      result.current.validateSettings({ ...result.current.settings, resultRange: [5, 1] })
    ).toEqual({ key: 'errors.invalidResultRange' });
    expect(
      result.current.validateSettings({ ...result.current.settings, numOperandsRange: [5, 2] })
    ).toEqual({ key: 'errors.invalidOperandsRange' });
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
});
