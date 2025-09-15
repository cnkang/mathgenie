import { useEffect, type FC, type ReactElement } from 'react';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters?: Record<string, unknown>) => void;
  }
}

// Performance memory interface
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// Extend Performance interface
interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

// Performance entry with value property
interface PerformanceEntryWithValue extends PerformanceEntry {
  value?: number;
}

/**
 * Performance Monitor Component with TypeScript support
 * Tracks and reports performance metrics for optimization
 */
type PerformanceMonitorProps = { children?: ReactElement | null };

const PerformanceMonitor: FC<PerformanceMonitorProps> = ({ children }) => {
  useEffect(() => {
    const isProd = import.meta.env.PROD;
    const devLogger: ((...args: unknown[]) => void) | undefined = import.meta.env.DEV
      ? (...args: unknown[]) => console.log(...args)
      : undefined;

    const observer = createPerformanceObserver(isProd, devLogger);
    try {
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    } catch (error) {
      console.warn('Performance observer not fully supported:', error);
    }

    const cleanupMemory = setupMemoryLogging(performance as ExtendedPerformance, devLogger);
    return () => {
      cleanupMemory?.();
      observer.disconnect();
    };
  }, []);

  return children ? <>{children}</> : null;
};

const createPerformanceObserver = (
  isProd: boolean,
  devLogger?: (...args: unknown[]) => void
): PerformanceObserver => {
  const reportEntry = (entry: PerformanceEntry): void => {
    const entryWithValue = entry as PerformanceEntryWithValue;
    const value = entryWithValue.value ?? entry.duration;
    if (devLogger) {
      devLogger(`${entry.name}: ${value}ms`);
    } else if (isProd && window.gtag) {
      window.gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: entry.name,
        value: Math.round(value || 0),
        non_interaction: true,
      });
    }
  };

  return new PerformanceObserver(list => {
    list.getEntries().forEach(reportEntry);
  });
};

const setupMemoryLogging = (
  perf: ExtendedPerformance,
  devLogger?: (...args: unknown[]) => void
): (() => void) | undefined => {
  if (!perf.memory) {
    return undefined;
  }

  const logMemoryUsage = (): void => {
    const memory = perf.memory!;
    devLogger?.('Memory usage:', {
      used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
    });
  };

  const memoryInterval = setInterval(logMemoryUsage, 30000);
  return () => clearInterval(memoryInterval);
};

export default PerformanceMonitor;
