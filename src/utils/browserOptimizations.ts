/**
 * Browser-specific optimizations for MathGenie
 * Provides performance enhancements for different browsers, particularly Firefox
 */

// Browser detection utilities
export const getBrowserInfo = () => {
  if (typeof navigator === 'undefined') {
    return { isFirefox: false, isChrome: false, isSafari: false, isEdge: false };
  }

  const { userAgent } = navigator;
  return {
    isFirefox: userAgent.includes('Firefox'),
    isChrome: userAgent.includes('Chrome') && !userAgent.includes('Edg'), // Edge uses 'Edg' not 'Edge'
    isSafari: userAgent.includes('Safari') && !userAgent.includes('Chrome'),
    isEdge: userAgent.includes('Edg'), // Modern Edge uses 'Edg' in user agent
  };
};

// Firefox-specific optimizations
export const getFirefoxOptimizations = () => ({
  // Reduced batch sizes for DOM operations
  domBatchSize: 10,

  // Longer debounce delays for better performance
  debounceDelays: {
    resize: 500,
    mutation: 200,
    scroll: 150,
  },

  // Simplified selectors for better query performance
  useSimplifiedSelectors: true,

  // Reduced MutationObserver scope
  mutationObserverConfig: {
    childList: true,
    subtree: false,
    attributes: true,
    attributeFilter: ['style', 'class'],
  },

  // Use getBoundingClientRect instead of computed styles when possible
  preferBoundingRect: true,

  // Batch style updates to reduce reflows
  batchStyleUpdates: true,
});

// Chrome-specific optimizations
export const getChromeOptimizations = () => ({
  domBatchSize: 25,
  debounceDelays: {
    resize: 250,
    mutation: 100,
    scroll: 100,
  },
  useSimplifiedSelectors: false,
  mutationObserverConfig: {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'hidden'],
  },
  preferBoundingRect: false,
  batchStyleUpdates: false,
});

// Get browser-specific optimizations
export const getBrowserOptimizations = () => {
  const { isFirefox } = getBrowserInfo();

  if (isFirefox) {
    return getFirefoxOptimizations();
  }

  return getChromeOptimizations();
};

// Helper function to log performance warnings
const logPerformanceWarning = (
  isFirefox: boolean,
  duration: number,
  operationName: string
): void => {
  if (isFirefox && duration > 10) {
    console.warn(`Firefox: Slow DOM operation "${operationName}" took ${duration.toFixed(2)}ms`);
  }
};

// Helper function to measure operation performance
const measureOperation = <T>(operation: () => T, operationName: string, isFirefox: boolean): T => {
  const start = performance.now();
  const result = operation();
  const end = performance.now();
  const duration = end - start;

  logPerformanceWarning(isFirefox, duration, operationName);
  return result;
};

// Helper function to handle DOM operation measurement
const handleDOMOperationMeasurement = <T>(
  operation: () => T,
  operationName: string,
  isFirefox: boolean,
  shouldMeasure: boolean
): T => {
  if (!shouldMeasure) {
    return operation();
  }
  return measureOperation(operation, operationName, isFirefox);
};

// Helper function to handle browser info logging
const handleBrowserInfoLogging = (shouldLog: boolean): void => {
  if (!shouldLog) {
    return;
  }
  const browserInfo = getBrowserInfo();
  console.log('Browser optimizations applied:', browserInfo);
};

// Performance monitoring for different browsers
export const createPerformanceMonitor = () => {
  const { isFirefox } = getBrowserInfo();
  const isDevelopment = import.meta.env.DEV;

  return {
    measureDOMOperation: <T>(operation: () => T, operationName: string): T => {
      return handleDOMOperationMeasurement(operation, operationName, isFirefox, isDevelopment);
    },

    logBrowserInfo: () => {
      handleBrowserInfoLogging(isDevelopment);
    },
  };
};

// Helper function to create Firefox-specific styles
const createFirefoxStyles = (): HTMLStyleElement => {
  const style = document.createElement('style');
  style.textContent = `
    /* Firefox-specific performance optimizations */
    * {
      /* Reduce Firefox's aggressive anti-aliasing */
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* Optimize Firefox scrolling performance */
    * {
      scroll-behavior: auto !important;
    }
    
    /* Reduce Firefox reflow triggers */
    button, input, select, textarea {
      will-change: auto;
    }
    
    @media (prefers-reduced-motion: reduce) {
      * {
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
      }
    }
  `;
  return style;
};

// Utility to apply browser-specific CSS optimizations
export const applyBrowserSpecificStyles = () => {
  const { isFirefox } = getBrowserInfo();
  const isDocumentAvailable = typeof document !== 'undefined';

  if (isFirefox && isDocumentAvailable) {
    // Add Firefox-specific CSS optimizations
    const style = createFirefoxStyles();
    document.head.appendChild(style);

    if (import.meta.env.DEV) {
      console.log('Firefox-specific CSS optimizations applied');
    }
  }
};
