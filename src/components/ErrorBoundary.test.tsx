import React, { act } from 'react';
import { afterAll, beforeAll, describe, expect, vi } from 'vitest';
import { fireEvent, render, renderHook, screen } from '../../tests/helpers/testUtils';
import { setViteEnv, useViteEnv } from '../../tests/helpers/viteEnv';
import ErrorBoundary, { useErrorHandler } from './ErrorBoundary';

// Create a component that throws errors
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console error output since we're intentionally throwing errors
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  useViteEnv();

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeDefined();
  });

  test('renders error fallback when there is an error', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(container.querySelector('h2')?.textContent).toBe('🚨 Something went wrong');
    expect(container.querySelector('.retry-button')?.textContent).toBe('🔄 Try Again');
    expect(container.querySelector('.reload-button')?.textContent).toBe('🔃 Reload Page');

    // In development environment, error details should exist
    if (import.meta.env.DEV) {
      expect(screen.getByText(/Error Details/)).toBeDefined();
    }
  });

  test('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeDefined();
  });

  test('calls onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  test('handles try again button click', () => {
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = container.querySelector('.reload-button');
    fireEvent.click(reloadButton!);

    expect(mockReload).toHaveBeenCalled();
  });

  test('handles retry button click', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(container.querySelector('h2')?.textContent).toBe('🚨 Something went wrong');

    const retryButton = container.querySelector('.retry-button');
    expect(retryButton).toBeDefined();

    // Just test that the button exists and can be clicked
    fireEvent.click(retryButton!);

    // The error boundary should still show error state after retry click
    expect(container.querySelector('h2')?.textContent).toBe('🚨 Something went wrong');
  });

  test('shows error details in development mode', () => {
    setViteEnv('development');

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Error Details/)).toBeDefined();
    expect(screen.getByText(/Test error/)).toBeDefined();
  });

  test('hides error details in production mode', () => {
    setViteEnv('production');

    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(container.querySelector('summary')).toBeNull();
  });

  test('handles error with custom error info', () => {
    const onError = vi.fn();
    const CustomError = () => {
      throw new Error('Custom test error');
    };

    render(
      <ErrorBoundary onError={onError}>
        <CustomError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Custom test error',
      }),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  test('maintains error state consistently', () => {
    const { rerender, container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(container.querySelector('h2')?.textContent).toBe('🚨 Something went wrong');

    // Rerender with same error component
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should still show error state
    expect(container.querySelector('h2')?.textContent).toBe('🚨 Something went wrong');
  });

  test('handles multiple error scenarios', () => {
    const onError = vi.fn();

    const { rerender, container } = render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(container.textContent).toContain('No error');

    // Trigger error
    rerender(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(container.querySelector('h2')?.textContent).toBe('🚨 Something went wrong');
    expect(onError).toHaveBeenCalledTimes(1);
  });
});

describe('useErrorHandler', () => {
  useViteEnv();

  test('initializes with no error', () => {
    const { result } = renderHook(() => useErrorHandler());

    expect(result.current.error).toBeNull();
    expect(typeof result.current.handleError).toBe('function');
    expect(typeof result.current.resetError).toBe('function');
  });

  test('handles error in production', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setViteEnv('production');

    const TestComponent = () => {
      const { handleError, error } = useErrorHandler();

      React.useEffect(() => {
        if (!error) {
          handleError(new Error('Test error'));
        }
      }, [handleError, error]);

      return <div>Test</div>;
    };

    expect(() => {
      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );
    }).not.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith('Application error:', 'Test error');

    consoleSpy.mockRestore();
  });

  test('resets error state', () => {
    let hookResult: any;

    const TestComponent = () => {
      hookResult = useErrorHandler();
      return <div>Test</div>;
    };

    render(<TestComponent />);

    expect(hookResult.error).toBeNull();

    act(() => {
      hookResult.resetError();
    });

    expect(hookResult.error).toBeNull();
  });

  test('throws error in useEffect when error is set', () => {
    const { result } = renderHook(() => useErrorHandler());
    const testError = new Error('Test error');

    expect(() => {
      act(() => {
        result.current.handleError(testError);
      });
    }).toThrow('Test error');
  });
});
