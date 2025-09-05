import { useMemo } from 'react';

interface LoadingStateConfig {
  isLoading?: boolean;
  isPending?: boolean;
  className?: string;
}

export const useLoadingState = ({
  isLoading = false,
  isPending = false,
  className = '',
}: LoadingStateConfig) => {
  const loadingProps = useMemo(() => {
    const classes = [className];

    if (isLoading) classes.push('loading-state');
    if (isPending) classes.push('pending-state');

    return {
      className: classes.filter(Boolean).join(' '),
      'aria-busy': isLoading || isPending,
      'data-loading': isLoading,
      'data-pending': isPending,
    };
  }, [isLoading, isPending, className]);

  return { loadingProps };
};
