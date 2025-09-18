// Setup for testing environment with happy-dom only
import { vi } from 'vitest';

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
    const element = received as Element;
    if (!element || !element.hasAttribute) {
      return {
        message: () => 'expected element to be a valid DOM element',
        pass: false,
      };
    }

    const hasAttribute = element.hasAttribute(attribute);
    if (expectedValue === undefined) {
      return {
        message: () =>
          `expected element ${hasAttribute ? 'not ' : ''}to have attribute "${attribute}"`,
        pass: hasAttribute,
      };
    }

    const actualValue = element.getAttribute(attribute);
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

// 简化的 crypto mock
Object.defineProperty(window, 'crypto', {
  writable: true,
  value: {
    getRandomValues: vi.fn((arr: Uint32Array) => {
      for (let i = 0; i < arr.length; i++) {
        // SONAR-SAFE: Using Math.random() for test mocking, not security-sensitive operations
        arr[i] = Math.floor(Math.random() * 0xffffffff);
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

// Mock window APIs once at startup
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
  mockStore = {};
});

afterEach(() => {
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
