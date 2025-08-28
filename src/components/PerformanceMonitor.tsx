import React, { useEffect } from 'react';
import type { PerformanceMonitorProps } from '../types';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
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

/**
 * Performance Monitor Component with TypeScript support
 * Tracks and reports performance metrics for optimization
 */
const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ children }) => {
  useEffect(() => {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Log performance metrics in development
        if (process.env.NODE_ENV === 'development') {
          const value = 'value' in entry ? (entry as any).value : entry.duration;
          console.log(`${entry.name}: ${value}ms`);
        }
        
        // Report to analytics in production (if needed)
        if (process.env.NODE_ENV === 'production' && window.gtag) {
          const value = 'value' in entry ? (entry as any).value : entry.duration;
          window.gtag('event', 'web_vitals', {
            event_category: 'Performance',
            event_label: entry.name,
            value: Math.round(value || 0),
            non_interaction: true,
          });
        }
      });
    });

    // Observe different performance metrics
    try {
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    } catch (error) {
      // Fallback for browsers that don't support all entry types
      console.warn('Performance observer not fully supported:', error);
    }

    // Memory usage monitoring (if available)
    const extendedPerformance = performance as ExtendedPerformance;
    if (extendedPerformance.memory) {
      const logMemoryUsage = (): void => {
        const memory = extendedPerformance.memory!;
        if (process.env.NODE_ENV === 'development') {
          console.log('Memory usage:', {
            used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
            total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
            limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
          });
        }
      };

      // Log memory usage every 30 seconds in development
      const memoryInterval = setInterval(logMemoryUsage, 30000);
      
      return () => {
        clearInterval(memoryInterval);
        observer.disconnect();
      };
    }

    return () => observer.disconnect();
  }, []);

  return children ? <>{children}</> : null;
};

export default PerformanceMonitor;