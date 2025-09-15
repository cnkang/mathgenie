import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { useProgressBar } from './useProgressBar';

describe('useProgressBar', () => {
  test('should calculate percentage correctly with default values', () => {
    const { result } = renderHook(() => useProgressBar({ value: 50 }));

    expect(result.current.percentage).toBe(50);
    expect(result.current.progressBarProps['aria-valuenow']).toBe(50);
    expect(result.current.progressBarProps['aria-valuemin']).toBe(0);
    expect(result.current.progressBarProps['aria-valuemax']).toBe(100);
    expect(result.current.progressFillProps.style.width).toBe('50%');
  });

  test('should calculate percentage with custom min and max', () => {
    const { result } = renderHook(() => useProgressBar({ value: 15, min: 10, max: 20 }));

    expect(result.current.percentage).toBe(50); // (15-10)/(20-10) * 100 = 50%
    expect(result.current.progressBarProps['aria-valuenow']).toBe(15);
    expect(result.current.progressBarProps['aria-valuemin']).toBe(10);
    expect(result.current.progressBarProps['aria-valuemax']).toBe(20);
    expect(result.current.progressFillProps.style.width).toBe('50%');
  });

  test('should clamp value to min when below minimum', () => {
    const { result } = renderHook(() => useProgressBar({ value: -10, min: 0, max: 100 }));

    expect(result.current.percentage).toBe(0);
    expect(result.current.progressBarProps['aria-valuenow']).toBe(-10); // Original value preserved
    expect(result.current.progressFillProps.style.width).toBe('0%');
  });

  test('should clamp value to max when above maximum', () => {
    const { result } = renderHook(() => useProgressBar({ value: 150, min: 0, max: 100 }));

    expect(result.current.percentage).toBe(100);
    expect(result.current.progressBarProps['aria-valuenow']).toBe(150); // Original value preserved
    expect(result.current.progressFillProps.style.width).toBe('100%');
  });

  test('should handle zero range (min equals max)', () => {
    const { result } = renderHook(() => useProgressBar({ value: 50, min: 50, max: 50 }));

    // When min equals max, percentage should be 100% (complete)
    expect(result.current.percentage).toBe(100);
    expect(result.current.progressFillProps.style.width).toBe('100%');
  });

  test('should apply custom className', () => {
    const { result } = renderHook(() =>
      useProgressBar({ value: 50, className: 'custom-progress' })
    );

    expect(result.current.progressBarProps.className).toBe('progress-bar custom-progress');
  });

  test('should handle empty className', () => {
    const { result } = renderHook(() => useProgressBar({ value: 50, className: '' }));

    expect(result.current.progressBarProps.className).toBe('progress-bar');
  });

  test('should have proper accessibility attributes', () => {
    const { result } = renderHook(() => useProgressBar({ value: 75 }));

    expect(result.current.progressBarProps.role).toBe('progressbar');
    expect(result.current.progressBarProps['aria-label']).toBe('Progress: 75%');
  });

  test('should update percentage when value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useProgressBar({ value }), {
      initialProps: { value: 25 },
    });

    expect(result.current.percentage).toBe(25);
    expect(result.current.progressFillProps.style.width).toBe('25%');

    rerender({ value: 75 });

    expect(result.current.percentage).toBe(75);
    expect(result.current.progressFillProps.style.width).toBe('75%');
  });

  test('should round percentage to nearest integer', () => {
    const { result } = renderHook(() => useProgressBar({ value: 33.333, min: 0, max: 100 }));

    expect(result.current.percentage).toBe(33); // Rounded down
    expect(result.current.progressFillProps.style.width).toBe('33%');
  });

  test('should handle negative min and max values', () => {
    const { result } = renderHook(() => useProgressBar({ value: -5, min: -10, max: 0 }));

    expect(result.current.percentage).toBe(50); // (-5 - (-10)) / (0 - (-10)) * 100 = 50%
    expect(result.current.progressBarProps['aria-valuemin']).toBe(-10);
    expect(result.current.progressBarProps['aria-valuemax']).toBe(0);
    expect(result.current.progressFillProps.style.width).toBe('50%');
  });

  test('should have consistent props structure', () => {
    const { result } = renderHook(() => useProgressBar({ value: 50 }));

    // Check progressBarProps structure
    expect(result.current.progressBarProps).toHaveProperty('className');
    expect(result.current.progressBarProps).toHaveProperty('role');
    expect(result.current.progressBarProps).toHaveProperty('aria-valuenow');
    expect(result.current.progressBarProps).toHaveProperty('aria-valuemin');
    expect(result.current.progressBarProps).toHaveProperty('aria-valuemax');
    expect(result.current.progressBarProps).toHaveProperty('aria-label');

    // Check progressFillProps structure
    expect(result.current.progressFillProps).toHaveProperty('className');
    expect(result.current.progressFillProps).toHaveProperty('style');
    expect(result.current.progressFillProps.style).toHaveProperty('width');
    expect(result.current.progressFillProps.className).toBe('progress-fill');
  });
});
