import { act, renderHook } from '../../tests/helpers/testUtils';
import { useLocalStorage } from './useLocalStorage';

// 使用全局 setupTests.ts 中的 localStorage mock

describe('useLocalStorage', () => {
  const localStorageMock = window.localStorage as any;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  test('should return initial value when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('default');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  test('should return stored value from localStorage', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('stored-value'));

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('stored-value');
  });

  test('should update localStorage when value changes', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
  });

  test('should handle localStorage errors gracefully', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('default');
    warnSpy.mockRestore();
  });

  test('should handle JSON parse errors gracefully', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorageMock.getItem.mockReturnValue('invalid-json');

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('default');
    warnSpy.mockRestore();
  });

  test('should handle setItem errors gracefully', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('setItem error');
    });

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[1]('new-value');
    });

    // Should still update the state even if localStorage fails
    expect(result.current[0]).toBe('new-value');
    warnSpy.mockRestore();
  });

  test('should handle function updates', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(5));
    localStorageMock.setItem.mockClear(); // Clear previous mock calls

    const { result } = renderHook(() => useLocalStorage('test-key', 0));

    act(() => {
      result.current[1](prev => prev + 1);
    });

    expect(result.current[0]).toBe(6);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(6));
  });

  test('should handle complex objects', () => {
    const complexObject = { name: 'test', items: [1, 2, 3], nested: { value: true } };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(complexObject));

    const { result } = renderHook(() => useLocalStorage('test-key', {}));

    expect(result.current[0]).toEqual(complexObject);
  });

  test('should handle array values', () => {
    const arrayValue = ['item1', 'item2', 'item3'];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(arrayValue));
    localStorageMock.setItem.mockClear(); // Clear previous mock calls

    const { result } = renderHook(() => useLocalStorage<string[]>('test-key', []));

    expect(result.current[0]).toEqual(arrayValue);

    act(() => {
      result.current[1]([...arrayValue, 'item4']);
    });

    expect(result.current[0]).toEqual(['item1', 'item2', 'item3', 'item4']);
  });

  test('should handle boolean values', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(true));
    localStorageMock.setItem.mockClear(); // Clear previous mock calls

    const { result } = renderHook(() => useLocalStorage('test-key', false));

    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1](false);
    });

    expect(result.current[0]).toBe(false);
  });

  test('should handle null values', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(null));

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe(null);
  });

  test('should handle undefined initial value', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('test-key', undefined));

    expect(result.current[0]).toBe(undefined);
  });

  test('should persist across re-renders', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('persisted'));

    const { result, rerender } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('persisted');

    rerender();

    expect(result.current[0]).toBe('persisted');
  });

  test('should handle empty string values', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(''));

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('');
  });

  test('should handle number values including zero', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(0));

    const { result } = renderHook(() => useLocalStorage('test-key', 10));

    expect(result.current[0]).toBe(0);
  });

  test('should handle storage events from other tabs', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('default');

    // Simulate storage event from another tab
    const storageEvent = new StorageEvent('storage', {
      key: 'test-key',
      newValue: JSON.stringify('updated-from-other-tab'),
      oldValue: null,
    });

    act(() => {
      window.dispatchEvent(storageEvent);
    });

    expect(result.current[0]).toBe('updated-from-other-tab');
  });

  test('should ignore storage events for different keys', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('initial'));

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('initial');

    // Simulate storage event for different key
    const storageEvent = new StorageEvent('storage', {
      key: 'other-key',
      newValue: JSON.stringify('should-be-ignored'),
    });

    act(() => {
      window.dispatchEvent(storageEvent);
    });

    expect(result.current[0]).toBe('initial');
  });

  test('should ignore storage events with null newValue', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('initial'));

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('initial');

    // Simulate storage event with null newValue (item removed)
    const storageEvent = new StorageEvent('storage', {
      key: 'test-key',
      newValue: null,
    });

    act(() => {
      window.dispatchEvent(storageEvent);
    });

    expect(result.current[0]).toBe('initial');
  });

  test('should handle JSON parse errors in storage events', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('initial'));
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('initial');

    // Simulate storage event with invalid JSON
    const storageEvent = new StorageEvent('storage', {
      key: 'test-key',
      newValue: 'invalid-json',
    });

    act(() => {
      window.dispatchEvent(storageEvent);
    });

    expect(result.current[0]).toBe('initial');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error parsing localStorage change for key "test-key":',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  test('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    localStorageMock.getItem.mockReturnValue(null);

    const { unmount } = renderHook(() => useLocalStorage('test-key', 'default'));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});
