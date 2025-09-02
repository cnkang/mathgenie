/// <reference types="vitest/globals" />

// Custom matchers for happy-dom testing environment
declare global {
  namespace Vi {
    interface Assertion<T = any> {
      toBeInTheDocument(): T;
      toHaveTextContent(text: string): T;
      toHaveValue(value: any): T;
    }
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
