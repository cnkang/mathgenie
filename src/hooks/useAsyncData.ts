import React, { useState } from 'react';

/**
 * Hook for handling Promise-based async data with React 19.2 optimizations
 * Provides better integration with Suspense and concurrent features
 */
export const useAsyncData = <T>(promise: Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    promise
      .then(result => {
        setData(result);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
      });
  }, [promise]);

  return { data, error, isLoading };
};
