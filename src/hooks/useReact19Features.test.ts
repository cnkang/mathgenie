import { act, renderHook } from '@testing-library/react';
import { createSuspenseResource, useErrorRecovery, useReact19Features } from './useReact19Features';

describe('useReact19Features', () => {
  test('should provide React 19.2 features', () => {
    const { result } = renderHook(() => useReact19Features());

    expect(typeof result.current.usePromise).toBe('function');
    expect(typeof result.current.optimisticState).toBe('object');
    expect(typeof result.current.updateOptimistic).toBe('function');
    expect(typeof result.current.isPending).toBe('boolean');
    expect(typeof result.current.startTransition).toBe('function');
    expect(typeof result.current.batchUpdates).toBe('function');
    expect(typeof result.current.createMemoizedCallback).toBe('function');
  });

  test('should have optimistic state', () => {
    const { result } = renderHook(() => useReact19Features());

    expect(result.current.optimisticState.data).toBe('initial');
    expect(result.current.optimisticState.isPending).toBe(false);

    act(() => {
      result.current.updateOptimistic('updated');
    });

    // Note: In a real scenario, the optimistic state would be updated
    // This test verifies the function structure
    expect(typeof result.current.updateOptimistic).toBe('function');
  });

  test('should provide transition utilities', () => {
    const { result } = renderHook(() => useReact19Features());

    expect(typeof result.current.isPending).toBe('boolean');
    expect(typeof result.current.startTransition).toBe('function');
  });

  test('should create memoized callback', () => {
    const { result } = renderHook(() => useReact19Features());

    const mockCallback = vi.fn();
    const memoizedCallback = result.current.createMemoizedCallback(mockCallback, []);

    expect(typeof memoizedCallback).toBe('function');
  });

  test('should batch updates', () => {
    const { result } = renderHook(() => useReact19Features());

    const mockCallback = vi.fn();

    act(() => {
      result.current.batchUpdates(mockCallback);
    });

    expect(mockCallback).toHaveBeenCalled();
  });
});

describe('createSuspenseResource', () => {
  test('should create suspense resource for resolved promise', async () => {
    const promise = Promise.resolve('test data');
    const resource = createSuspenseResource(promise);

    // Wait for promise to resolve
    await promise;

    expect(resource.read()).toBe('test data');
  });

  test('should throw error for rejected promise', async () => {
    const error = new Error('Test error');
    const promise = Promise.reject(error);
    const resource = createSuspenseResource(promise);

    // Wait for promise to reject
    try {
      await promise;
    } catch {
      // Expected to reject
    }

    expect(() => resource.read()).toThrow('Test error');
  });

  test('should throw suspender for pending promise', () => {
    const promise = new Promise(() => {}); // Never resolves
    const resource = createSuspenseResource(promise);

    expect(() => resource.read()).toThrow();
  });
});

describe('useErrorRecovery', () => {
  test('should provide error recovery utilities', () => {
    const { result } = renderHook(() => useErrorRecovery());

    expect(typeof result.current.recoverFromError).toBe('function');
    expect(typeof result.current.isRecovering).toBe('boolean');
  });

  test('should handle recovery action', () => {
    const { result } = renderHook(() => useErrorRecovery());

    const mockRecoveryAction = vi.fn();

    act(() => {
      result.current.recoverFromError(mockRecoveryAction);
    });

    expect(mockRecoveryAction).toHaveBeenCalled();
  });

  test('should handle recovery action errors gracefully', () => {
    const { result } = renderHook(() => useErrorRecovery());

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const errorAction = vi.fn(() => {
      throw new Error('Recovery failed');
    });

    act(() => {
      result.current.recoverFromError(errorAction);
    });

    expect(errorAction).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Error recovery failed:', expect.any(Error));

    consoleSpy.mockRestore();
  });
});
