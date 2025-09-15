/// <reference types="vitest/globals" />

// Custom matchers for happy-dom testing environment
// These are implemented in setupTests.ts and work with happy-dom
declare module 'vitest' {
  interface Assertion<T = unknown> {
    toBeInTheDocument(): T;
    toHaveTextContent(text: string): T;
    toHaveValue(value: string | number | boolean): T;
    toHaveClass(className: string): T;
    toHaveAttribute(attribute: string, expectedValue?: string): T;
  }
}

// Extend HTMLElement interface for testing with happy-dom
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

export {};
