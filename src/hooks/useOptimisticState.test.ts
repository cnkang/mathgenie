import { renderHook, act } from '@testing-library/react';
import { useOptimisticState } from './useOptimisticState';
import { vi } from 'vitest';

describe('useOptimisticState', () => {
  test('should return initial state', () => {
    const { result } = renderHook(() => useOptimisticState('initial'));
    
    expect(result.current.state).toBe('initial');
    expect(result.current.isPending).toBe(false);
  });

  test('should update state optimistically', () => {
    const { result } = renderHook(() => useOptimisticState('initial'));
    
    act(() => {
      result.current.updateOptimistic('optimistic');
    });
    
    expect(result.current.state).toBe('optimistic');
    expect(result.current.isPending).toBe(true);
  });

  test('should commit optimistic state', () => {
    const { result } = renderHook(() => useOptimisticState('initial'));
    
    act(() => {
      result.current.updateOptimistic('optimistic');
    });
    
    act(() => {
      result.current.commit();
    });
    
    expect(result.current.state).toBe('optimistic');
    expect(result.current.isPending).toBe(false);
  });

  test('should rollback optimistic state', () => {
    const { result } = renderHook(() => useOptimisticState('initial'));
    
    act(() => {
      result.current.updateOptimistic('optimistic');
    });
    
    act(() => {
      result.current.rollback();
    });
    
    expect(result.current.state).toBe('initial');
    expect(result.current.isPending).toBe(false);
  });

  test('should handle async operations', async () => {
    const { result } = renderHook(() => useOptimisticState('initial'));
    
    const asyncOperation = vi.fn().mockResolvedValue('async-result');
    
    await act(async () => {
      await result.current.performOptimistic('optimistic', asyncOperation);
    });
    
    expect(result.current.state).toBe('async-result');
    expect(result.current.isPending).toBe(false);
    expect(asyncOperation).toHaveBeenCalled();
  });

  test('should rollback on async operation failure', async () => {
    const { result } = renderHook(() => useOptimisticState('initial'));
    
    const asyncOperation = vi.fn().mockRejectedValue(new Error('Failed'));
    
    await act(async () => {
      try {
        await result.current.performOptimistic('optimistic', asyncOperation);
      } catch (error) {
        // Expected to throw
      }
    });
    
    expect(result.current.state).toBe('initial');
    expect(result.current.isPending).toBe(false);
  });
});