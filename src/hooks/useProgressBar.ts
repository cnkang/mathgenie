import { useMemo } from 'react';

interface ProgressBarConfig {
  value: number;
  max?: number;
  min?: number;
  className?: string;
}

export const useProgressBar = ({
  value,
  max = 100,
  min = 0,
  className = '',
}: ProgressBarConfig) => {
  const percentage = useMemo(() => {
    const clampedValue = Math.max(min, Math.min(max, value));
    return Math.round(((clampedValue - min) / (max - min)) * 100);
  }, [value, max, min]);

  const progressBarProps = useMemo(
    () => ({
      className: `progress-bar ${className}`.trim(),
      role: 'progressbar',
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
