import {
  getBrowserInfo,
  getFirefoxOptimizations,
  getChromeOptimizations,
  getBrowserOptimizations,
  createPerformanceMonitor,
  applyBrowserSpecificStyles,
} from './browserOptimizations';

// Mock navigator for browser detection tests
const mockNavigator = (userAgent: string) => {
  Object.defineProperty(navigator, 'userAgent', {
    value: userAgent,
    configurable: true,
  });
};

describe('Browser Optimizations', () => {
  const originalUserAgent = navigator.userAgent;

  afterEach(() => {
    mockNavigator(originalUserAgent);
  });

  describe('getBrowserInfo', () => {
    test('detects Firefox correctly', () => {
      mockNavigator('Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0');
      const info = getBrowserInfo();
      expect(info.isFirefox).toBe(true);
      expect(info.isChrome).toBe(false);
      expect(info.isSafari).toBe(false);
      expect(info.isEdge).toBe(false);
    });

    test('detects Chrome correctly', () => {
      mockNavigator(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
      const info = getBrowserInfo();
      expect(info.isFirefox).toBe(false);
      expect(info.isChrome).toBe(true);
      expect(info.isSafari).toBe(false);
      expect(info.isEdge).toBe(false);
    });

    test('detects Safari correctly', () => {
      mockNavigator(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
      );
      const info = getBrowserInfo();
      expect(info.isFirefox).toBe(false);
      expect(info.isChrome).toBe(false);
      expect(info.isSafari).toBe(true);
      expect(info.isEdge).toBe(false);
    });

    test('detects Edge correctly', () => {
      mockNavigator(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
      );
      const info = getBrowserInfo();
      expect(info.isFirefox).toBe(false);
      expect(info.isChrome).toBe(false); // Fixed: Edge detection now properly excludes Chrome
      expect(info.isSafari).toBe(false);
      expect(info.isEdge).toBe(true);
    });

    test('handles undefined navigator gracefully', () => {
      const originalNavigator = global.navigator;
      delete (global as any).navigator;

      const info = getBrowserInfo();
      expect(info.isFirefox).toBe(false);
      expect(info.isChrome).toBe(false);
      expect(info.isSafari).toBe(false);
      expect(info.isEdge).toBe(false);

      global.navigator = originalNavigator;
    });
  });

  describe('getFirefoxOptimizations', () => {
    test('returns Firefox-specific optimization settings', () => {
      const opts = getFirefoxOptimizations();

      expect(opts.domBatchSize).toBe(10);
      expect(opts.debounceDelays.resize).toBe(500);
      expect(opts.debounceDelays.mutation).toBe(200);
      expect(opts.debounceDelays.scroll).toBe(150);
      expect(opts.useSimplifiedSelectors).toBe(true);
      expect(opts.preferBoundingRect).toBe(true);
      expect(opts.batchStyleUpdates).toBe(true);
    });

    test('returns correct MutationObserver config for Firefox', () => {
      const opts = getFirefoxOptimizations();

      expect(opts.mutationObserverConfig.childList).toBe(true);
      expect(opts.mutationObserverConfig.subtree).toBe(false);
      expect(opts.mutationObserverConfig.attributes).toBe(true);
      expect(opts.mutationObserverConfig.attributeFilter).toEqual(['style', 'class']);
    });
  });

  describe('getChromeOptimizations', () => {
    test('returns Chrome-specific optimization settings', () => {
      const opts = getChromeOptimizations();

      expect(opts.domBatchSize).toBe(25);
      expect(opts.debounceDelays.resize).toBe(250);
      expect(opts.debounceDelays.mutation).toBe(100);
      expect(opts.debounceDelays.scroll).toBe(100);
      expect(opts.useSimplifiedSelectors).toBe(false);
      expect(opts.preferBoundingRect).toBe(false);
      expect(opts.batchStyleUpdates).toBe(false);
    });

    test('returns correct MutationObserver config for Chrome', () => {
      const opts = getChromeOptimizations();

      expect(opts.mutationObserverConfig.childList).toBe(true);
      expect(opts.mutationObserverConfig.subtree).toBe(true);
      expect(opts.mutationObserverConfig.attributes).toBe(true);
      expect(opts.mutationObserverConfig.attributeFilter).toEqual(['style', 'class', 'hidden']);
    });
  });

  describe('getBrowserOptimizations', () => {
    test('returns Firefox optimizations when Firefox is detected', () => {
      mockNavigator('Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0');

      const opts = getBrowserOptimizations();
      expect(opts.domBatchSize).toBe(10); // Firefox-specific
      expect(opts.useSimplifiedSelectors).toBe(true); // Firefox-specific
    });

    test('returns Chrome optimizations for non-Firefox browsers', () => {
      mockNavigator(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124'
      );

      const opts = getBrowserOptimizations();
      expect(opts.domBatchSize).toBe(25); // Chrome-specific
      expect(opts.useSimplifiedSelectors).toBe(false); // Chrome-specific
    });
  });

  describe('createPerformanceMonitor', () => {
    const createSlowOperation = (durationMs = 15): (() => string) => {
      return () => {
        const start = Date.now();
        while (Date.now() - start < durationMs) {
          // Simulate slow operation
        }
        return 'result';
      };
    };

    test('measures DOM operations and returns result', () => {
      const monitor = createPerformanceMonitor();
      const testOperation = () => 'test result';

      const result = monitor.measureDOMOperation(testOperation, 'test operation');
      expect(result).toBe('test result');
    });

    test('logs performance warnings for slow Firefox operations in dev mode', () => {
      mockNavigator('Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0');
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = true;

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const monitor = createPerformanceMonitor();

      const slowOperation = createSlowOperation();

      monitor.measureDOMOperation(slowOperation, 'slow operation');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Firefox: Slow DOM operation "slow operation"')
      );

      consoleSpy.mockRestore();
      (import.meta.env as any).DEV = originalEnv;
    });

    test('does not log warnings in production mode', () => {
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = false;

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const monitor = createPerformanceMonitor();

      const slowOperation = createSlowOperation();

      monitor.measureDOMOperation(slowOperation, 'slow operation');

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      (import.meta.env as any).DEV = originalEnv;
    });

    test('logs browser info in development mode', () => {
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = true;

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const monitor = createPerformanceMonitor();

      monitor.logBrowserInfo();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Browser optimizations applied:',
        expect.objectContaining({
          isFirefox: expect.any(Boolean),
          isChrome: expect.any(Boolean),
          isSafari: expect.any(Boolean),
          isEdge: expect.any(Boolean),
        })
      );

      consoleSpy.mockRestore();
      (import.meta.env as any).DEV = originalEnv;
    });

    test('does not log browser info in production mode', () => {
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = false;

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const monitor = createPerformanceMonitor();

      monitor.logBrowserInfo();

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      (import.meta.env as any).DEV = originalEnv;
    });
  });

  describe('applyBrowserSpecificStyles', () => {
    test('applies Firefox-specific styles when Firefox is detected', () => {
      mockNavigator('Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0');

      const originalHead = document.head;
      const mockHead = {
        appendChild: vi.fn(),
      };
      Object.defineProperty(document, 'head', {
        value: mockHead,
        configurable: true,
      });

      applyBrowserSpecificStyles();

      expect(mockHead.appendChild).toHaveBeenCalledWith(
        expect.objectContaining({
          textContent: expect.stringContaining('-moz-osx-font-smoothing'),
        })
      );

      Object.defineProperty(document, 'head', {
        value: originalHead,
        configurable: true,
      });
    });

    test('does not apply styles for non-Firefox browsers', () => {
      mockNavigator(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124'
      );

      const originalHead = document.head;
      const mockHead = {
        appendChild: vi.fn(),
      };
      Object.defineProperty(document, 'head', {
        value: mockHead,
        configurable: true,
      });

      applyBrowserSpecificStyles();

      expect(mockHead.appendChild).not.toHaveBeenCalled();

      Object.defineProperty(document, 'head', {
        value: originalHead,
        configurable: true,
      });
    });

    test('logs Firefox CSS optimization message in dev mode', () => {
      mockNavigator('Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0');
      const originalEnv = import.meta.env.DEV;
      (import.meta.env as any).DEV = true;

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const originalHead = document.head;
      const mockHead = {
        appendChild: vi.fn(),
      };
      Object.defineProperty(document, 'head', {
        value: mockHead,
        configurable: true,
      });

      applyBrowserSpecificStyles();

      expect(consoleSpy).toHaveBeenCalledWith('Firefox-specific CSS optimizations applied');

      consoleSpy.mockRestore();
      Object.defineProperty(document, 'head', {
        value: originalHead,
        configurable: true,
      });
      (import.meta.env as any).DEV = originalEnv;
    });

    test('handles undefined document gracefully', () => {
      mockNavigator('Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0');

      const originalDocument = global.document;
      delete (global as any).document;

      expect(() => applyBrowserSpecificStyles()).not.toThrow();

      global.document = originalDocument;
    });
  });
});
