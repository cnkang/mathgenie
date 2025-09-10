/// <reference types="vitest/globals" />

// Custom matchers for happy-dom testing environment
declare module 'vitest' {
  interface Assertion<T = unknown> {
    toBeInTheDocument(): T;
    toHaveTextContent(text: string): T;
    toHaveValue(value: string | number | boolean): T;
  }
}

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

export {};
