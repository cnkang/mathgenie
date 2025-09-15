import { useMemo } from 'react';

interface ProgressBarConfig {
  value: number;
  max?: number;
  min?: number;
  className?: string;
}

interface UseProgressBarResult {
  percentage: number;
  progressBarProps: {
    className: string;
    role: 'progressbar';
    'aria-valuenow': number;
    'aria-valuemin': number;
    'aria-valuemax': number;
    'aria-label': string;
  };
  progressFillProps: {
    className: string;
    style: { width: string };
  };
}

export const useProgressBar = ({
  value,
  max = 100,
  min = 0,
  className = '',
}: ProgressBarConfig): UseProgressBarResult => {
  const percentage = useMemo(() => {
    const clampedValue = Math.max(min, Math.min(max, value));
    const range = max - min;
    // Handle zero range (min equals max) - consider it 100% complete
    if (range === 0) {
      return 100;
    }
    return Math.round(((clampedValue - min) / range) * 100);
  }, [value, max, min]);

  const progressBarProps = useMemo(
    () => ({
      className: `progress-bar ${className}`.trim(),
      role: 'progressbar' as const,
      'aria-valuenow': value,
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-label': `Progress: ${percentage}%`,
    }),
    [className, value, min, max, percentage]
  );

  const progressFillProps = useMemo(
    () => ({
      className: 'progress-fill',
      style: { width: `${percentage}%` } as const,
    }),
    [percentage]
  );

  return {
    percentage,
    progressBarProps,
    progressFillProps,
  };
};
