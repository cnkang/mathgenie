import { useCallback, useMemo, useOptimistic, useTransition } from 'react';

/**
 * React 19.2 Features Hook
 * Provides optimistic state management and enhanced transitions
 */

interface OptimisticState<T> {
  data: T;
  isPending: boolean;
}

interface UseReact19FeaturesReturn {
  optimisticState: OptimisticState<string>;
  updateOptimistic: (action: string | ((prev: string) => string)) => void;
  isPending: boolean;
  startTransition: (callback: () => void) => void;
}

export const useReact19Features = (): UseReact19FeaturesReturn => {
  const [isPending, startTransition] = useTransition();

  const [optimisticState, addOptimistic] = useOptimistic(
    { data: 'initial', isPending: false },
    (state: OptimisticState<string>, action: string | ((prev: string) => string)) => ({
      data: typeof action === 'function' ? action(state.data) : action,
      isPending: true,
    })
  );

  const updateOptimistic = useCallback(
    (action: string | ((prev: string) => string)) => {
      addOptimistic(action);
    },
    [addOptimistic]
  );

  const enhancedStartTransition = useCallback(
    (callback: () => void) => {
      startTransition(() => {
        try {
          callback();
        } catch (error) {
          console.error('Transition error:', error);
        }
      });
    },
    [startTransition]
  );

  return useMemo(
    () => ({
      optimisticState,
      updateOptimistic,
      isPending,
      startTransition: enhancedStartTransition,
    }),
    [optimisticState, updateOptimistic, isPending, enhancedStartTransition]
  );
};

/**
 * Suspense resource wrapper for async data loading
 */
export interface SuspenseResource<T> {
  read(): T;
}

export const createSuspenseResource = <T>(promise: Promise<T>): SuspenseResource<T> => {
  let status = 'pending';
  let result: T;
  let error: unknown;

  const suspender = promise.then(
    res => {
      status = 'success';
      result = res;
    },
    err => {
      status = 'error';
      error = err;
    }
  );

  return {
    read() {
      if (status === 'pending') {
        throw suspender;
      }
      if (status === 'error') {
        throw error;
      }
      return result;
    },
  };
};

/**
 * Error recovery hook using transitions
 */
export const useErrorRecovery = () => {
  const [isPending, startTransition] = useTransition();

  const recoverFromError = useCallback(
    (recoveryAction: () => void) => {
      startTransition(() => {
        try {
          recoveryAction();
        } catch (err) {
          console.error('Error recovery failed:', err);
        }
      });
    },
    [startTransition]
  );

  return { recoverFromError, isRecovering: isPending };
};
