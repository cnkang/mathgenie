import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PerformanceMonitor from './PerformanceMonitor';

// Mock PerformanceObserver
class MockPerformanceObserver {
  callback: PerformanceObserverCallback;
  
  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback;
  }
  
  observe() {}
  disconnect() {}
}

describe('PerformanceMonitor', () => {
  let originalPerformanceObserver: typeof PerformanceObserver;
  let consoleLogSpy: ReturnType<typeof vi.fn>;
  let consoleWarnSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    originalPerformanceObserver = global.PerformanceObserver;
    global.PerformanceObserver = MockPerformanceObserver as any;
    
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
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

  it('returns null when no children provided', () => {
    const { container } = render(<PerformanceMonitor />);
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
    const ErrorObserver = class {
      constructor() {}
      observe() {
        throw new Error('Observer not supported');
      }
      disconnect() {}
    };
    
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
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const mockObserver = new MockPerformanceObserver(() => {});
    const mockEntry = {
      name: 'test-metric',
      value: 100
    };
    
    mockObserver.callback([mockEntry] as any, mockObserver as any);
    
    render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );
    
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('handles memory monitoring with interval', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
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
      limit: '200 MB'
    });
    
    unmount();
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('handles production environment with gtag', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const mockGtag = vi.fn();
    (global as any).window = { gtag: mockGtag };
    
    const mockObserver = new MockPerformanceObserver((list) => {
      const mockEntry = {
        name: 'test-metric',
        value: 150
      };
      list.getEntries = () => [mockEntry];
    });
    
    render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );
    
    process.env.NODE_ENV = originalNodeEnv;
    delete (global as any).window;
  });

  it('handles entries without value property', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    // Mock window for this test
    Object.defineProperty(global, 'window', {
      value: {},
      configurable: true
    });
    
    const mockObserver = new MockPerformanceObserver(() => {});
    const mockEntry = {
      name: 'test-metric',
      duration: 200
    };
    
    mockObserver.callback([mockEntry] as any, mockObserver as any);
    
    render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );
    
    process.env.NODE_ENV = originalNodeEnv;
    delete (global as any).window;
  });

  it('cleans up memory interval on unmount', () => {
    // Mock window for this test
    Object.defineProperty(global, 'window', {
      value: {},
      configurable: true
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
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    Object.defineProperty(global, 'window', {
      value: {},
      configurable: true
    });
    
    let observerCallback: PerformanceObserverCallback;
    
    class TestObserver {
      constructor(callback: PerformanceObserverCallback) {
        observerCallback = callback;
      }
      observe() {}
      disconnect() {}
    }
    
    global.PerformanceObserver = TestObserver as any;
    
    render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );
    
    const mockEntries = [
      { name: 'test-metric', value: 100 },
      { name: 'test-duration', duration: 200 }
    ];
    
    const mockList = {
      getEntries: () => mockEntries
    };
    
    observerCallback!(mockList as any, {} as any);
    
    expect(consoleLogSpy).toHaveBeenCalledWith('test-metric: 100ms');
    expect(consoleLogSpy).toHaveBeenCalledWith('test-duration: 200ms');
    
    process.env.NODE_ENV = originalNodeEnv;
    delete (global as any).window;
  });

  it('triggers performance observer callback in production with gtag', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const mockGtag = vi.fn();
    Object.defineProperty(global, 'window', {
      value: { gtag: mockGtag },
      configurable: true
    });
    
    let observerCallback: PerformanceObserverCallback;
    
    class TestObserver {
      constructor(callback: PerformanceObserverCallback) {
        observerCallback = callback;
      }
      observe() {}
      disconnect() {}
    }
    
    global.PerformanceObserver = TestObserver as any;
    
    render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );
    
    const mockEntries = [
      { name: 'test-metric', value: 150 }
    ];
    
    const mockList = {
      getEntries: () => mockEntries
    };
    
    observerCallback!(mockList as any, {} as any);
    
    expect(mockGtag).toHaveBeenCalledWith('event', 'web_vitals', {
      event_category: 'Performance',
      event_label: 'test-metric',
      value: 150,
      non_interaction: true,
    });
    
    process.env.NODE_ENV = originalNodeEnv;
    delete (global as any).window;
  });

  it('handles production environment without gtag', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    Object.defineProperty(global, 'window', {
      value: {},
      configurable: true
    });
    
    let observerCallback: PerformanceObserverCallback;
    
    class TestObserver {
      constructor(callback: PerformanceObserverCallback) {
        observerCallback = callback;
      }
      observe() {}
      disconnect() {}
    }
    
    global.PerformanceObserver = TestObserver as any;
    
    render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );
    
    const mockEntries = [
      { name: 'test-metric', value: 150 }
    ];
    
    const mockList = {
      getEntries: () => mockEntries
    };
    
    expect(() => {
      observerCallback!(mockList as any, {} as any);
    }).not.toThrow();
    
    process.env.NODE_ENV = originalNodeEnv;
    delete (global as any).window;
  });

  it('handles entries with undefined/null values', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const mockGtag = vi.fn();
    Object.defineProperty(global, 'window', {
      value: { gtag: mockGtag },
      configurable: true
    });
    
    let observerCallback: PerformanceObserverCallback;
    
    class TestObserver {
      constructor(callback: PerformanceObserverCallback) {
        observerCallback = callback;
      }
      observe() {}
      disconnect() {}
    }
    
    global.PerformanceObserver = TestObserver as any;
    
    render(
      <PerformanceMonitor>
        <div>Test</div>
      </PerformanceMonitor>
    );
    
    const mockEntries = [
      { name: 'test-metric', value: null },
      { name: 'test-duration', duration: undefined }
    ];
    
    const mockList = {
      getEntries: () => mockEntries
    };
    
    observerCallback!(mockList as any, {} as any);
    
    expect(mockGtag).toHaveBeenCalledWith('event', 'web_vitals', {
      event_category: 'Performance',
      event_label: 'test-metric',
      value: 0,
      non_interaction: true,
    });
    
    process.env.NODE_ENV = originalNodeEnv;
    delete (global as any).window;
  });
});