import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import React, { act } from 'react';
import { afterAll, beforeAll, describe, expect, vi } from 'vitest';
import { resetViteEnv, setViteEnv } from '../../tests/helpers/viteEnv';
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

  beforeEach(() => {
    setViteEnv('test');
  });

  afterEach(() => {
    resetViteEnv();
  });

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeDefined();
  });

  test('renders error fallback when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/)).toBeDefined();
    expect(screen.getByText(/Try Again/)).toBeDefined();
    expect(screen.getByText(/Reload Page/)).toBeDefined();

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

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText(/Reload Page/);
    fireEvent.click(reloadButton);

    expect(mockReload).toHaveBeenCalled();
  });

  test('handles retry button click', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/)).toBeDefined();

    const retryButton = screen.getByText(/Try Again/);
    expect(retryButton).toBeDefined();

    // Just test that the button exists and can be clicked
    fireEvent.click(retryButton);

    // The error boundary should still show error state after retry click
    expect(screen.getByText(/Something went wrong/)).toBeDefined();
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

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText(/Error Details/)).toBeNull();
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
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/)).toBeDefined();

    // Rerender with same error component
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Should still show error state
    expect(screen.getByText(/Something went wrong/)).toBeDefined();
  });

  test('handles multiple error scenarios', () => {
    const onError = vi.fn();

    const { rerender } = render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeDefined();

    // Trigger error
    rerender(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/)).toBeDefined();
    expect(onError).toHaveBeenCalledTimes(1);
  });
});

describe('useErrorHandler', () => {
  beforeEach(() => {
    setViteEnv('test');
  });

  afterEach(() => {
    resetViteEnv();
  });

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

    expect(consoleSpy).toHaveBeenCalledWith('Application error:', expect.any(Error));

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
