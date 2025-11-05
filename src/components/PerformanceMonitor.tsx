import {
  useConcurrentFeatures,
  useEnhancedCache,
  usePerformanceTracking,
} from '@/hooks/usePerformance';
import React, { useDeferredValue, useEffect, useState } from 'react';

interface PerformanceData {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage?: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showDetails?: boolean;
  children?: React.ReactNode;
}

/**
 * Performance monitor component with React concurrent features
 * - Enhanced batching for better performance tracking
 * - Improved caching mechanisms
 * - Better memory management
 */
const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  showDetails = false,
  children,
}) => {
  const { performanceMetrics, trackRender } = usePerformanceTracking();
  const { isPending, scheduleUpdate } = useConcurrentFeatures();
  const [memoryInfo, setMemoryInfo] = useState<number | undefined>();

  // Use React 19.2's useDeferredValue for better performance
  const deferredMemoryInfo = useDeferredValue(memoryInfo);
  const deferredMetrics = useDeferredValue(performanceMetrics);

  // Use React 19.2's enhanced caching for performance data
  const cachedPerformanceData = useEnhancedCache<PerformanceData>('performance-data', () => ({
    ...deferredMetrics,
    memoryUsage: deferredMemoryInfo,
  }));

  useEffect(() => {
    if (!enabled) return;

    trackRender();

    // Monitor memory usage if available (Chrome DevTools)
    if (
      'memory' in performance &&
      (performance as { memory?: { usedJSHeapSize: number } }).memory
    ) {
      const { memory } = performance as { memory: { usedJSHeapSize: number } };
      setMemoryInfo(memory.usedJSHeapSize);
    }
  }, [enabled, trackRender]);

  // React 19.2 enhanced batching for state updates
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      // Use concurrent features for better performance
      scheduleUpdate(() => {
        if (
          'memory' in performance &&
          (performance as { memory?: { usedJSHeapSize: number } }).memory
        ) {
          const { memory } = performance as { memory: { usedJSHeapSize: number } };
          setMemoryInfo(memory.usedJSHeapSize);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, scheduleUpdate]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div
        className='performance-monitor'
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 9999,
          minWidth: '200px',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          React 19.2 Performance {isPending && '⏳'}
        </div>

        <div>Renders: {cachedPerformanceData.renderCount}</div>

        {showDetails && (
          <>
            <div>Avg Render: {cachedPerformanceData.averageRenderTime.toFixed(2)}ms</div>
            {cachedPerformanceData.memoryUsage && (
              <div>Memory: {(cachedPerformanceData.memoryUsage / 1024 / 1024).toFixed(2)}MB</div>
            )}
            <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>
              Enhanced with React 19.2 concurrent features, batching & caching
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PerformanceMonitor;
