import { useCallback, useDeferredValue, useMemo, useRef, useTransition } from "react";

/**
 * Hook for tracking component performance metrics
 * Leverages React 19.2's enhanced automatic batching
 */
export const usePerformanceTracking = () => {
  const renderCountRef = useRef(0);

  const durations = useRef({ total: 0, last: 0 });
  const trackRender = useCallback((duration = 0) => {
    renderCountRef.current += 1;
    durations.current.total += duration;
    durations.current.last = Date.now();
  }, []);
  const performanceMetrics = useMemo(
    () => ({
      get renderCount() {
        return renderCountRef.current;
      },
      get lastRenderTime() {
        return durations.current.last;
      },
      get averageRenderTime() {
        return renderCountRef.current ? durations.current.total / renderCountRef.current : 0;
      },
    }),
    [],
  );

  return {
    trackRender,
    performanceMetrics,
  };
};

/**
 * Enhanced cache hook leveraging React 19.2's improved caching mechanisms
 */
export const useEnhancedCache = <T>(key: string, factory: () => T) => {
  const cacheRef = useRef<Map<string, { value: T; timestamp: number }>>(new Map());

  return useMemo(() => {
    const cached = cacheRef.current.get(key);
    const now = Date.now();

    // Cache for 5 minutes
    if (cached && now - cached.timestamp < 300000) {
      return cached.value;
    }

    const value = factory();
    cacheRef.current.set(key, { value, timestamp: now });

    // Clean old entries
    for (const [cacheKey, cacheValue] of cacheRef.current.entries()) {
      if (now - cacheValue.timestamp > 300000) {
        cacheRef.current.delete(cacheKey);
      }
    }

    return value;
  }, [key, factory]);
};

/**
 * React 19.2 enhanced concurrent rendering utilities
 */
export const useConcurrentFeatures = () => {
  const [isPending, startTransition] = useTransition();

  // Helper to get useDeferredValue hook for external use
  const getDeferredValueHook = useCallback(() => {
    return useDeferredValue;
  }, []);

  const scheduleUpdate = useCallback(
    (callback: () => void) => {
      startTransition(callback);
    },
    [startTransition],
  );

  const batchUpdates = useCallback(
    (updates: (() => void)[]) => {
      startTransition(() => {
        updates.forEach((update) => update());
      });
    },
    [startTransition],
  );

  return {
    isPending,
    getDeferredValueHook,
    scheduleUpdate,
    batchUpdates,
  };
};
