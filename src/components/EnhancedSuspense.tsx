import ErrorBoundary from '@/components/ErrorBoundary';
import { useConcurrentFeatures } from '@/hooks/usePerformance';
import { useErrorRecovery, useReact19Features } from '@/hooks/useReact19Features';
import React, { Suspense, useDeferredValue, useTransition } from 'react';

interface EnhancedSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
  enableOptimisticUpdates?: boolean;
}

/**
 * Enhanced Suspense component leveraging React 19.2 concurrent features
 * Provides better error handling, optimistic updates, and performance monitoring
 */
const EnhancedSuspense: React.FC<EnhancedSuspenseProps> = ({
  children,
  fallback = <div>Loading...</div>,
  onError,
  enableOptimisticUpdates = false,
}) => {
  const { isPending, scheduleUpdate } = useConcurrentFeatures();
  const [isTransitioning] = useTransition();
  const {
    optimisticState,
    updateOptimistic,
    startTransition: enhancedStartTransition,
  } = useReact19Features();
  const { recoverFromError, isRecovering } = useErrorRecovery();

  // Use deferred value for smoother transitions
  const deferredChildren = useDeferredValue(children);

  // Use optimistic state from the hook if enabled
  const shouldUseOptimistic = enableOptimisticUpdates;

  const handleError = React.useCallback(
    (error: Error) => {
      if (onError) {
        // Use React 19.2's enhanced batching for error handling
        scheduleUpdate(() => {
          onError(error);
        });
      }

      // Update optimistic state if enabled
      if (shouldUseOptimistic && updateOptimistic) {
        updateOptimistic('error');
      }

      // Attempt error recovery
      recoverFromError(() => {
        console.log('Attempting to recover from error:', error.message);
      });
    },
    [onError, scheduleUpdate, shouldUseOptimistic, updateOptimistic, recoverFromError]
  );

  const handleRetry = React.useCallback(() => {
    enhancedStartTransition(() => {
      if (shouldUseOptimistic && updateOptimistic) {
        updateOptimistic('retry');
      }
    });
  }, [enhancedStartTransition, shouldUseOptimistic, updateOptimistic]);

  // Determine loading state
  const isLoading = isPending || isTransitioning || isRecovering;
  const showOptimisticError = shouldUseOptimistic && optimisticState?.data === 'error';

  // Enhanced fallback with loading states
  const enhancedFallback = (
    <div
      style={{
        opacity: isLoading ? 0.7 : 1,
        transition: 'opacity 0.2s ease-in-out',
      }}
    >
      {showOptimisticError ? (
        <div className='error-fallback'>
          <p>Something went wrong</p>
          <button onClick={handleRetry}>Try Again</button>
        </div>
      ) : (
        fallback
      )}
      {isRecovering && (
        <div className='recovery-indicator'>
          <small>Recovering...</small>
        </div>
      )}
    </div>
  );

  return (
    <Suspense fallback={enhancedFallback}>
      <ErrorBoundary onError={handleError}>{deferredChildren}</ErrorBoundary>
    </Suspense>
  );
};

export default EnhancedSuspense;
