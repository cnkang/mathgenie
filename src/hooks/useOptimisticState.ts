import { useState, useCallback } from 'react';

export const useOptimisticState = <T>(initialValue: T) => {
  const [actualState, setActualState] = useState<T>(initialValue);
  const [optimisticState, setOptimisticState] = useState<T | null>(null);
  const [isPending, setIsPending] = useState(false);

  const updateOptimistic = useCallback((value: T) => {
    setOptimisticState(value);
    setIsPending(true);
  }, []);

  const commit = useCallback(() => {
    if (optimisticState !== null) {
      setActualState(optimisticState);
    }
    setOptimisticState(null);
    setIsPending(false);
  }, [optimisticState]);

  const rollback = useCallback(() => {
    setOptimisticState(null);
    setIsPending(false);
  }, []);

  const performOptimistic = useCallback(async (value: T, asyncFn: () => Promise<T>) => {
    updateOptimistic(value);
    try {
      const result = await asyncFn();
      setActualState(result);
      setOptimisticState(null);
      setIsPending(false);
    } catch (error) {
      rollback();
      throw error;
    }
  }, [updateOptimistic, rollback]);

  return {
    state: optimisticState !== null ? optimisticState : actualState,
    isPending,
    updateOptimistic,
    commit,
    rollback,
    performOptimistic,
  };
};