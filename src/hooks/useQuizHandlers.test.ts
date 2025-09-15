import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { Problem } from '@/types';
import { useQuizHandlers } from './useAppLogic';

const mockProblems: Problem[] = [
  { id: 1, text: '2 + 3 = ?', correctAnswer: 5 },
  { id: 2, text: '4 + 5 = ?', correctAnswer: 9 },
];

describe('useQuizHandlers (isolated)', () => {
  test('should start quiz mode when problems exist', () => {
    const mockSetError = vi.fn();
    const mockSetIsQuizMode = vi.fn();
    const mockSetQuizResult = vi.fn();

    const { result } = renderHook(() =>
      useQuizHandlers(mockProblems, true, mockSetError, mockSetIsQuizMode, mockSetQuizResult)
    );

    expect(result.current).toBeTruthy();
    expect(typeof result.current.startQuizMode).toBe('function');
    expect(typeof result.current.exitQuizMode).toBe('function');

    act(() => {
      result.current.startQuizMode();
    });

    expect(mockSetIsQuizMode).toHaveBeenCalledWith(true);
    expect(mockSetQuizResult).toHaveBeenCalledWith(null);
  });

  test('should set error when no problems exist and i18n is ready', () => {
    const mockSetError = vi.fn();
    const mockSetIsQuizMode = vi.fn();
    const mockSetQuizResult = vi.fn();

    const { result } = renderHook(() =>
      useQuizHandlers([], true, mockSetError, mockSetIsQuizMode, mockSetQuizResult)
    );

    expect(result.current).toBeTruthy();
    expect(typeof result.current.startQuizMode).toBe('function');

    act(() => {
      result.current.startQuizMode();
    });

    expect(mockSetError).toHaveBeenCalledWith({ key: 'errors.noProblemsForQuiz' });
    expect(mockSetIsQuizMode).not.toHaveBeenCalled();
  });

  test('should not set error when no problems exist and i18n is not ready', () => {
    const mockSetError = vi.fn();
    const mockSetIsQuizMode = vi.fn();
    const mockSetQuizResult = vi.fn();

    const { result } = renderHook(() =>
      useQuizHandlers([], false, mockSetError, mockSetIsQuizMode, mockSetQuizResult)
    );

    expect(result.current).toBeTruthy();
    expect(typeof result.current.startQuizMode).toBe('function');

    act(() => {
      result.current.startQuizMode();
    });

    expect(mockSetError).not.toHaveBeenCalled();
    expect(mockSetIsQuizMode).not.toHaveBeenCalled();
  });

  test('should exit quiz mode', () => {
    const mockSetError = vi.fn();
    const mockSetIsQuizMode = vi.fn();
    const mockSetQuizResult = vi.fn();

    const { result } = renderHook(() =>
      useQuizHandlers(mockProblems, true, mockSetError, mockSetIsQuizMode, mockSetQuizResult)
    );

    act(() => {
      result.current.exitQuizMode();
    });

    expect(mockSetIsQuizMode).toHaveBeenCalledWith(false);
  });
});
