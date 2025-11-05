import { render, screen, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import EnhancedSuspense from './EnhancedSuspense';

// Mock the hooks
vi.mock('@/hooks/usePerformance', () => ({
  useConcurrentFeatures: () => ({
    isPending: false,
    scheduleUpdate: vi.fn(),
  }),
}));

vi.mock('@/hooks/useReact19Features', () => ({
  useReact19Features: () => ({
    createTransition: () => [false, vi.fn()],
    createOptimisticState: () => [{ data: { children: null, hasError: false } }, vi.fn()],
  }),
  useErrorRecovery: () => ({
    recoverFromError: vi.fn(),
    isRecovering: false,
  }),
}));

describe('EnhancedSuspense', () => {
  test('should render children when not suspended', () => {
    render(
      <EnhancedSuspense>
        <div>Test Content</div>
      </EnhancedSuspense>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('should render fallback when suspended', () => {
    const SuspendingComponent = () => {
      throw new Promise(() => {}); // Never resolves
    };

    render(
      <EnhancedSuspense fallback={<div>Loading...</div>}>
        <SuspendingComponent />
      </EnhancedSuspense>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('should render custom fallback', () => {
    const SuspendingComponent = () => {
      throw new Promise(() => {}); // Never resolves
    };

    render(
      <EnhancedSuspense fallback={<div>Custom Loading</div>}>
        <SuspendingComponent />
      </EnhancedSuspense>
    );

    expect(screen.getByText('Custom Loading')).toBeInTheDocument();
  });

  test.skip('should handle error callback', async () => {
    const onError = vi.fn();
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // In React 19.2, we need to wrap in act and handle the error differently
    await act(async () => {
      render(
        <EnhancedSuspense onError={onError}>
          <ErrorComponent />
        </EnhancedSuspense>
      );
    });

    // React 19.2 may handle errors synchronously in some cases
    // Wait for error boundary to catch and process the error
    await waitFor(
      () => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
      },
      { timeout: 2000 }
    );

    consoleSpy.mockRestore();
  });

  test.skip('should enable optimistic updates when requested', () => {
    render(
      <EnhancedSuspense enableOptimisticUpdates>
        <div>Optimistic Content</div>
      </EnhancedSuspense>
    );

    expect(screen.getByText('Optimistic Content')).toBeInTheDocument();
  });
});
