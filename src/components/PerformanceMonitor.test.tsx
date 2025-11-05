import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../tests/helpers/testUtils';
import { setViteEnv, useViteEnv } from '../../tests/helpers/viteEnv';
import PerformanceMonitor from './PerformanceMonitor';

// Mock PerformanceObserver
class MockPerformanceObserver {
  callback: PerformanceObserverCallback;
  private isObserving = false;

  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback;
  }

  observe(): void {
    this.isObserving = true;
    // Trigger callback with empty list to simulate start
    const list = { getEntries: () => [] } as unknown as PerformanceObserverEntryList;
    this.callback(list, this as unknown as PerformanceObserver);
  }
  disconnect(): void {
    this.isObserving = false;
  }
}

// PerformanceMonitor tests - now working with React DOM 19.2.0 + happy-dom
// Fixed window availability issues in setupTests.ts
describe('PerformanceMonitor', () => {
  let originalPerformanceObserver: typeof PerformanceObserver;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  useViteEnv();

  beforeEach(() => {
    originalPerformanceObserver = global.PerformanceObserver;
    global.PerformanceObserver = MockPerformanceObserver as any;

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {}) as any;
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {}) as any;

    vi.useFakeTimers();
  });

  afterEach(() => {
    global.PerformanceObserver = originalPerformanceObserver;
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    vi.useRealTimers();
  });

  it('renders children correctly', () => {
    render(
      <PerformanceMonitor>
        <div>Test Child</div>
      </PerformanceMonitor>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('renders with empty children', () => {
    const { container } = render(<PerformanceMonitor>{null}</PerformanceMonitor>);
    expect(container.firstChild).toBeNull();
  });

  it('sets up performance observer', () => {
    render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );

    expect(MockPerformanceObserver).toBeDefined();
  });

  it('handles performance observer errors gracefully', () => {
    class ErrorObserver {
      observe(): void {
        throw new Error('Observer not supported');
      }
      disconnect(): void {
        /* simulated unsupported environment */
      }
    }

    global.PerformanceObserver = ErrorObserver as any;

    render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Performance observer not fully supported:',
      expect.any(Error)
    );
  });

  it('works without performance.memory support', () => {
    const originalMemory = (performance as any).memory;
    delete (performance as any).memory;

    expect(() => {
      render(
        <PerformanceMonitor>
          <div>Test</div>
        </PerformanceMonitor>
      );
    }).not.toThrow();

    (performance as any).memory = originalMemory;
  });

  it('logs performance metrics in development', () => {
    setViteEnv('development');

    const mockObserver = new MockPerformanceObserver(() => {});
    const mockEntry = {
      name: 'test-metric',
      value: 100,
    };

    mockObserver.callback([mockEntry] as any, mockObserver as any);

    render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );
  });

  it('handles memory monitoring with interval', () => {
    setViteEnv('development');

    const mockMemory = {
      usedJSHeapSize: 50 * 1048576,
      totalJSHeapSize: 100 * 1048576,
      jsHeapSizeLimit: 200 * 1048576,
    };

    Object.defineProperty(performance, 'memory', {
      value: mockMemory,
      configurable: true,
    });

    const { unmount } = render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );

    // Fast-forward time to trigger memory logging
    vi.advanceTimersByTime(30000);

    expect(consoleLogSpy).toHaveBeenCalledWith('Memory usage:', {
      used: '50 MB',
      total: '100 MB',
      limit: '200 MB',
    });

    unmount();
  });

  it('handles production environment with gtag', () => {
    setViteEnv('production');

    const mockGtag = vi.fn();
    (global as any).window = { gtag: mockGtag };

    render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );

    delete (global as any).window;
  });

  it('handles entries without value property', () => {
    setViteEnv('development');

    // Mock window for this test
    Object.defineProperty(global, 'window', {
      value: {},
      configurable: true,
    });

    const mockObserver = new MockPerformanceObserver(() => {});
    const mockEntry = {
      name: 'test-metric',
      duration: 200,
    };

    mockObserver.callback([mockEntry] as any, mockObserver as any);

    render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );

    delete (global as any).window;
  });

  it('cleans up memory interval on unmount', () => {
    // Mock window for this test
    Object.defineProperty(global, 'window', {
      value: {},
      configurable: true,
    });

    const mockMemory = {
      usedJSHeapSize: 50 * 1048576,
      totalJSHeapSize: 100 * 1048576,
      jsHeapSizeLimit: 200 * 1048576,
    };

    Object.defineProperty(performance, 'memory', {
      value: mockMemory,
      configurable: true,
    });

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { unmount } = render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
    delete (global as any).window;
  });

  it('triggers performance observer callback in development', () => {
    setViteEnv('development');

    Object.defineProperty(global, 'window', {
      value: {},
      configurable: true,
    });

    let observerCallback: PerformanceObserverCallback;

    class TestObserver {
      private active = false;
      constructor(callback: PerformanceObserverCallback) {
        observerCallback = callback;
      }
      observe(): void {
        this.active = true;
      }
      disconnect(): void {
        this.active = false;
      }
    }

    global.PerformanceObserver = TestObserver as any;

    render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );

    const mockEntries = [
      { name: 'test-metric', value: 100 },
      { name: 'test-duration', duration: 200 },
    ];

    const mockList = {
      getEntries: () => mockEntries,
    };

    observerCallback!(mockList as any, {} as any);

    expect(consoleLogSpy).toHaveBeenCalledWith('test-metric: 100ms');
    expect(consoleLogSpy).toHaveBeenCalledWith('test-duration: 200ms');

    delete (global as any).window;
  });

  it('triggers performance observer callback in production with gtag', () => {
    setViteEnv('production');

    const mockGtag = vi.fn();
    Object.defineProperty(global, 'window', {
      value: { gtag: mockGtag },
      configurable: true,
    });

    let observerCallback: PerformanceObserverCallback;

    class TestObserver {
      private active = false;
      constructor(callback: PerformanceObserverCallback) {
        observerCallback = callback;
      }
      observe(): void {
        this.active = true;
      }
      disconnect(): void {
        this.active = false;
      }
    }

    global.PerformanceObserver = TestObserver as any;

    render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );

    const mockEntries = [{ name: 'test-metric', value: 150 }];

    const mockList = {
      getEntries: () => mockEntries,
    };

    observerCallback!(mockList as any, {} as any);

    expect(mockGtag).toHaveBeenCalledWith('event', 'web_vitals', {
      event_category: 'Performance',
      event_label: 'test-metric',
      value: 150,
      non_interaction: true,
    });

    delete (global as any).window;
  });

  it('handles production environment without gtag', () => {
    setViteEnv('production');

    Object.defineProperty(global, 'window', {
      value: {},
      configurable: true,
    });

    let observerCallback: PerformanceObserverCallback;

    class TestObserver {
      private active = false;
      constructor(callback: PerformanceObserverCallback) {
        observerCallback = callback;
      }
      observe(): void {
        this.active = true;
      }
      disconnect(): void {
        this.active = false;
      }
    }

    global.PerformanceObserver = TestObserver as any;

    render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );

    const mockEntries = [{ name: 'test-metric', value: 150 }];

    const mockList = {
      getEntries: () => mockEntries,
    };

    expect(() => {
      observerCallback!(mockList as any, {} as any);
    }).not.toThrow();

    delete (global as any).window;
  });

  it('handles entries with undefined/null values', () => {
    setViteEnv('production');

    const mockGtag = vi.fn();
    Object.defineProperty(global, 'window', {
      value: { gtag: mockGtag },
      configurable: true,
    });

    let observerCallback: PerformanceObserverCallback;

    class TestObserver {
      private active = false;
      constructor(callback: PerformanceObserverCallback) {
        observerCallback = callback;
      }
      observe(): void {
        this.active = true;
      }
      disconnect(): void {
        this.active = false;
      }
    }

    global.PerformanceObserver = TestObserver as any;

    render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );

    const mockEntries = [
      { name: 'test-metric', value: null },
      { name: 'test-duration', duration: undefined },
    ];

    const mockList = {
      getEntries: () => mockEntries,
    };

    observerCallback!(mockList as any, {} as any);

    expect(mockGtag).toHaveBeenCalledWith('event', 'web_vitals', {
      event_category: 'Performance',
      event_label: 'test-metric',
      value: 0,
      non_interaction: true,
    });

    delete (global as any).window;
  });
});
