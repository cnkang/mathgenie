import { vi } from 'vitest';
import { act, renderHook } from '../../tests/helpers/testUtils';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  test('should debounce value changes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Should still be initial

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  test('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    // First change
    rerender({ value: 'change1', delay: 500 });

    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Second change before first completes
    rerender({ value: 'change2', delay: 500 });

    // Advance time to complete first timer
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('initial'); // Should still be initial

    // Complete second timer
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('change2');
  });

  test('should handle zero delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 0 },
    });

    rerender({ value: 'updated', delay: 0 });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe('updated');
  });
});
