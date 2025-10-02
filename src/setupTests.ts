// Setup for testing environment with happy-dom only
import { vi } from 'vitest';

// Ensure window is available for React DOM operations
// This is critical for React 19.2.0 + happy-dom 19.0.2 compatibility

// First, ensure we have a proper global object
if (typeof globalThis === 'undefined') {
  (global as any).globalThis = global;
}

// Create a comprehensive window object that React DOM expects
const createMockWindow = () => {
  return {
    // Copy all globalThis properties
    ...globalThis,

    // Essential browser APIs
    document: globalThis.document || {},
    location: globalThis.location || {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/',
      search: '',
      hash: '',
    },
    navigator: globalThis.navigator || {
      userAgent: 'Mozilla/5.0 (Node.js) Test Environment',
      language: 'en-US',
      languages: ['en-US', 'en'],
    },
    history: globalThis.history || {
      pushState: vi.fn(),
      replaceState: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      go: vi.fn(),
      length: 1,
      state: null,
    },

    // Event handling
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),

    // Animation and timing
    requestAnimationFrame: vi.fn((cb: FrameRequestCallback) => setTimeout(cb, 16)),
    cancelAnimationFrame: vi.fn(),
    requestIdleCallback: vi.fn((cb: IdleRequestCallback) => setTimeout(cb, 0)),
    cancelIdleCallback: vi.fn(),

    // Timers (use globalThis versions)
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval,

    // Event constructors
    Event:
      globalThis.Event ||
      class Event {
        constructor(
          public type: string,
          public eventInitDict?: EventInit
        ) {}
        preventDefault = vi.fn();
        stopPropagation = vi.fn();
        stopImmediatePropagation = vi.fn();
        bubbles = false;
        cancelable = false;
        composed = false;
        currentTarget = null;
        defaultPrevented = false;
        eventPhase = 0;
        isTrusted = false;
        target = null;
        timeStamp = Date.now();
      },
    CustomEvent:
      globalThis.CustomEvent ||
      class CustomEvent extends Event {
        constructor(type: string, eventInitDict?: CustomEventInit) {
          super(type, eventInitDict);
          this.detail = eventInitDict?.detail;
        }
        detail: any;
      },

    // Console (use globalThis version)
    console: globalThis.console,

    // Performance API
    performance: globalThis.performance || {
      now: () => Date.now(),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn(() => []),
      getEntriesByType: vi.fn(() => []),
      clearMarks: vi.fn(),
      clearMeasures: vi.fn(),
      timeOrigin: Date.now(),
    },

    // Screen information
    screen: {
      width: 1024,
      height: 768,
      availWidth: 1024,
      availHeight: 768,
      colorDepth: 24,
      pixelDepth: 24,
    },

    // Window dimensions
    innerWidth: 1024,
    innerHeight: 768,
    outerWidth: 1024,
    outerHeight: 768,
    screenX: 0,
    screenY: 0,
    scrollX: 0,
    scrollY: 0,

    // Window methods
    alert: vi.fn(),
    confirm: vi.fn(() => true),
    prompt: vi.fn(() => ''),
    open: vi.fn(),
    close: vi.fn(),
    focus: vi.fn(),
    blur: vi.fn(),
    scroll: vi.fn(),
    scrollTo: vi.fn(),
    scrollBy: vi.fn(),

    // Storage
    localStorage: globalThis.localStorage || {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    },
    sessionStorage: globalThis.sessionStorage || {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    },

    // Self-references (important for React DOM)
    get window(): any {
      return this;
    },
    get self(): any {
      return this;
    },
    get top(): any {
      return this;
    },
    get parent(): any {
      return this;
    },
    get frames(): any {
      return this;
    },
  };
};

// Only create window if it doesn't exist
if (typeof window === 'undefined') {
  const mockWindow = createMockWindow();

  // Set window on globalThis
  Object.defineProperty(globalThis, 'window', {
    value: mockWindow,
    writable: true,
    configurable: true,
  });

  // Also set it as a global variable for React DOM
  (global as any).window = mockWindow;

  // Ensure window is also available as a direct global
  Object.defineProperty(global, 'window', {
    value: mockWindow,
    writable: true,
    configurable: true,
  });
}

// Ensure window has all necessary properties for React DOM
if (typeof window !== 'undefined') {
  // Performance API
  if (!window.performance) {
    Object.defineProperty(window, 'performance', {
      value: {
        now: () => Date.now(),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntriesByName: vi.fn(() => []),
        getEntriesByType: vi.fn(() => []),
      },
      writable: true,
      configurable: true,
    });
  }

  // Ensure essential window properties exist
  if (!window.document) {
    Object.defineProperty(window, 'document', {
      value: globalThis.document || {},
      writable: true,
      configurable: true,
    });
  }

  if (!window.requestAnimationFrame) {
    Object.defineProperty(window, 'requestAnimationFrame', {
      value: vi.fn((cb: FrameRequestCallback) => setTimeout(cb, 16)),
      writable: true,
      configurable: true,
    });
  }

  if (!window.cancelAnimationFrame) {
    Object.defineProperty(window, 'cancelAnimationFrame', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
  }

  if (!window.addEventListener) {
    Object.defineProperty(window, 'addEventListener', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
  }

  if (!window.removeEventListener) {
    Object.defineProperty(window, 'removeEventListener', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
  }

  if (!window.dispatchEvent) {
    Object.defineProperty(window, 'dispatchEvent', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
  }
}

// Custom matchers are declared in src/types/vitest.d.ts

// Extend HTMLElement interface for testing
declare global {
  interface HTMLElement {
    value?: string;
    disabled?: boolean;
  }

  interface HTMLInputElement {
    value: string;
    disabled: boolean;
  }

  interface HTMLButtonElement {
    disabled: boolean;
  }
}

// Custom matchers for happy-dom
expect.extend({
  toBeInTheDocument(received: unknown): { pass: boolean; message: () => string } {
    const node = received as Node | null | undefined;
    const pass = !!(node && document.body.contains(node));
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to be in the document`,
      pass,
    };
  },
  toHaveTextContent(
    received: { textContent?: string | null } | null | undefined,
    expected: string
  ): { pass: boolean; message: () => string } {
    const pass = received?.textContent?.includes(expected) ?? false;
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to have text content "${expected}"`,
      pass,
    };
  },
  toHaveValue(
    received: { value?: string | number } | null | undefined,
    expected: string | number
  ): { pass: boolean; message: () => string } {
    const pass =
      (received?.value ?? undefined) === expected ||
      (received?.value ?? undefined) === String(expected);
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to have value "${expected}"`,
      pass,
    };
  },
  toHaveClass(
    received: { className?: string } | null | undefined,
    expected: string
  ): { pass: boolean; message: () => string } {
    const className = received?.className ?? '';
    const pass = className.split(' ').includes(expected);
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to have class "${expected}"`,
      pass,
    };
  },
  toHaveAttribute(
    received: Element | null | undefined,
    attribute: string,
    expectedValue?: string
  ): { pass: boolean; message: () => string } {
    const element = received as Element | null | undefined;
    if (!element?.hasAttribute) {
      return {
        message: () => 'expected element to be a valid DOM element',
        pass: false,
      };
    }

    const targetElement = element as Element;
    const hasAttribute = targetElement.hasAttribute(attribute);
    if (expectedValue === undefined) {
      return {
        message: () =>
          `expected element ${hasAttribute ? 'not ' : ''}to have attribute "${attribute}"`,
        pass: hasAttribute,
      };
    }

    const actualValue = targetElement.getAttribute(attribute);
    const pass = hasAttribute && actualValue === expectedValue;
    return {
      message: () =>
        `expected element ${pass ? 'not ' : ''}to have attribute "${attribute}" with value "${expectedValue}"`,
      pass,
    };
  },
});

// 轻量级 Canvas mock
const createMockContext = () => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: [0, 0, 0, 0] })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({ data: [0, 0, 0, 0] })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
});

const mockCanvas = {
  getContext: vi.fn(createMockContext),
  toDataURL: vi.fn(() => ''),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

Object.defineProperty(window, 'HTMLCanvasElement', {
  writable: true,
  value: vi.fn().mockImplementation(() => mockCanvas),
});

// 简化的 crypto mock using Node.js crypto for security compliance
import { randomBytes } from 'crypto';

Object.defineProperty(window, 'crypto', {
  writable: true,
  value: {
    getRandomValues: vi.fn((arr: Uint32Array) => {
      // Use Node.js crypto.randomBytes for cryptographically secure random values
      const bytes = randomBytes(arr.length * 4); // 4 bytes per Uint32
      for (let i = 0; i < arr.length; i++) {
        // Convert 4 bytes to Uint32
        arr[i] = bytes.readUInt32BE(i * 4);
      }
      return arr;
    }),
  },
});

// 简化的 localStorage mock
let mockStore: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string): string | null => mockStore[key] || null),
  setItem: vi.fn((key: string, value: string): void => {
    mockStore[key] = value;
  }),
  removeItem: vi.fn((key: string): void => {
    delete mockStore[key];
  }),
  clear: vi.fn((): void => {
    mockStore = {};
  }),
};

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: localStorageMock,
});

// Global test cleanup
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

// Store original console methods (for potential future use)
// const originalConsole = {
//   error: console.error,
//   warn: console.warn,
//   log: console.log,
// };

// Ensure window is always available for React DOM operations
const ensureWindow = () => {
  if (typeof window === 'undefined') {
    const mockWindow = createMockWindow();
    Object.defineProperty(globalThis, 'window', {
      value: mockWindow,
      writable: true,
      configurable: true,
    });
    (global as any).window = mockWindow;
  }
};

// Mock window APIs once at startup
ensureWindow();

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// 简化清理逻辑
beforeEach(() => {
  ensureWindow(); // Ensure window is available before each test
  mockStore = {};
});

afterEach(() => {
  ensureWindow(); // Ensure window is available during cleanup
  cleanup();
  mockStore = {};
});

// jsdom polyfills for missing browser APIs used in tests
// URL.createObjectURL and revokeObjectURL are not implemented in jsdom
try {
  // Safely attach mocks without throwing in environments that already provide them
  if (typeof URL !== 'undefined') {
    const g: any = globalThis as any;
    if (!('createObjectURL' in URL)) {
      g.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    }
    if (!('revokeObjectURL' in URL)) {
      g.URL.revokeObjectURL = vi.fn();
    }
  }
} catch {
  // Ignore polyfill errors in non-jsdom environments
}
