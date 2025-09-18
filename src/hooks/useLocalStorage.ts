import { useState, useEffect } from 'react';

/**
 * Custom hook for localStorage with JSON serialization and TypeScript support
 * Provides persistent state management across browser sessions
 */
export const useLocalStorage = <T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = (newValue: T | ((prev: T) => T)): void => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, JSON.stringify(error));
    }
  };

  useEffect(() => {
    const parseNewValue = (rawValue: string | null): T | null => {
      if (!rawValue) {
        return null;
      }

      try {
        return JSON.parse(rawValue);
      } catch (error) {
        console.warn(`Error parsing localStorage change for key "${key}":`, error);
        return null;
      }
    };

    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key !== key) {
        return;
      }

      const parsedValue = parseNewValue(event.newValue);
      if (parsedValue !== null) {
        setValue(parsedValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [value, setStoredValue];
};
