import { vi } from 'vitest';

/**
 * Test helper for mocking console methods consistently across the test suite
 */
export class ConsoleMock {
  private spies: Array<{ method: keyof Console; spy: ReturnType<typeof vi.spyOn> }> = [];

  /**
   * Mock console methods to suppress output during tests
   */
  mockConsole(methods: Array<keyof Console> = ['warn', 'error']) {
    for (const method of methods) {
      const spy = vi.spyOn(console, method as any).mockImplementation(() => {});
      this.spies.push({ method, spy });
    }
  }

  /**
   * Restore all mocked console methods
   */
  restoreConsole() {
    for (const { spy } of this.spies) {
      spy.mockRestore();
    }
    this.spies = [];
  }

  /**
   * Get a specific console spy for assertions
   */
  getSpy(method: keyof Console) {
    return this.spies.find((s) => s.method === method)?.spy;
  }
}

/**
 * Convenience function for common console mocking pattern
 */
export function withConsoleMock<T>(
  methods: Array<keyof Console>,
  testFn: (consoleMock: ConsoleMock) => T
): T {
  const consoleMock = new ConsoleMock();
  consoleMock.mockConsole(methods);
  try {
    return testFn(consoleMock);
  } finally {
    consoleMock.restoreConsole();
  }
}