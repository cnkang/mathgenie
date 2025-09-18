# MathGenie Hook Architecture Patterns

## Hook Architecture Philosophy

MathGenie uses a balanced hook architecture that promotes code reusability, maintainability, and performance while following React 19 best practices.

## Architecture Patterns

### Pattern 1: Simplified Internal Organization
**Use for**: Hooks with a single primary concern (like `useProblemGenerator`)

```typescript
export const useProblemGenerator = (
  settings: Settings,
  isLoading: boolean,
  validateSettings: (settings: Settings) => string
) => {
  const [problems, setProblems] = useState<Problem[]>([]);

  // ✅ Organize complex logic with useCallback for performance
  const processGeneration = useCallback(
    (showSuccessMessage: boolean) => {
      const validationError = validateSettings(settings);
      if (validationError) {
        return processValidationError(validationError);
      }
      return createGenerationOutcome({ settings, showSuccessMessage, setProblems });
    },
    [settings, validateSettings, setProblems]
  );

  const generateProblems = useCallback(
    (showSuccessMessage: boolean = true) => {
      if (isLoading) {
        return { ...EMPTY_MESSAGES };
      }
      return processGeneration(showSuccessMessage);
    },
    [isLoading, processGeneration]
  );

  // Auto-regeneration effect with proper cleanup
  useEffect(() => {
    if (!isLoading) {
      generateProblems(false);
    }
  }, [settings, isLoading, validateSettings]);

  return { problems, generateProblems };
};
```

### Pattern 2: Modular Helper Hooks
**Use for**: Complex multi-concern hooks (like `useAppLogic`)

```typescript
// ✅ Extract complex logic into focused helper hooks
const useValidationFeedback = (
  validateSettings: (s: Settings) => string,
  checkRestrictiveSettings: (s: Settings) => boolean,
  setError: (msg: MessageValue) => void,
  setWarning: (msg: MessageValue) => void
) => {
  return useCallback((pendingSettings: Settings): void => {
    const validationError = validateSettings(pendingSettings);
    if (validationError) {
      setError({ key: validationError });
      return;
    }
    if (checkRestrictiveSettings(pendingSettings)) {
      setWarning({ key: 'warnings.restrictiveSettings' });
    }
  }, [validateSettings, setError, checkRestrictiveSettings, setWarning]);
};

// ✅ Compose helper hooks in main hook
export const useAppHandlers = (...params) => {
  const provideValidationFeedback = useValidationFeedback(...);
  const shouldValidateField = useFieldValidation(...);

  const handleChange = useCallback((field, value) => {
    const newSettings = { ...settings, [field]: value };
    clearMessages();
    if (shouldValidateField(field)) {
      provideValidationFeedback(newSettings);
    }
    setSettings(newSettings);
  }, [settings, clearMessages, shouldValidateField, provideValidationFeedback, setSettings]);

  return { handleChange, handleApplyPreset };
};
```

## React 19 useEffect Best Practices

### Custom Hook Abstraction
```typescript
const useAsyncEffect = <T>(asyncFn: () => Promise<T>, deps: React.DependencyArray) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();
    
    const runAsync = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFn();
        if (!isCancelled) setData(result);
      } catch (err) {
        if (!isCancelled) setError(err as Error);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    
    runAsync();
    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, deps);
  
  return { data, loading, error };
};
```

### AbortController for Cancellation
```typescript
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then(response => response.json())
    .then(data => setState(data))
    .catch(error => {
      if (error.name !== 'AbortError') {
        setError(error);
      }
    });
  
  return () => controller.abort();
}, []);
```

### Race Condition Prevention
```typescript
useEffect(() => {
  let isLatest = true;
  
  fetchData(query).then(result => {
    if (isLatest) {
      setData(result);
    }
  });
  
  return () => { isLatest = false; };
}, [query]);
```

### State Management Pattern
```typescript
type AsyncState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

const [state, setState] = useState<AsyncState<Data>>({ status: 'idle' });
```

### Cleanup Resource Management
```typescript
useEffect(() => {
  const timer = setInterval(() => setTime(Date.now()), 1000);
  const listener = (e: Event) => handleEvent(e);
  
  window.addEventListener('resize', listener);
  
  return () => {
    clearInterval(timer);
    window.removeEventListener('resize', listener);
  };
}, []);
```

### React Strict Mode Compatibility
```typescript
// ✅ Good: Idempotent effect that handles double execution
useEffect(() => {
  let subscription: Subscription | null = null;
  
  const subscribe = async () => {
    if (!subscription) {
      subscription = await createSubscription();
    }
  };
  
  subscribe();
  
  return () => {
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }
  };
}, []);
```

## Hook Testing Patterns

### Simplified Hook Testing
```typescript
describe('useProblemGenerator', () => {
  test('should generate problems and return success message', () => {
    const validateSettings = vi.fn(() => '');
    const { result } = renderHook(() => useProblemGenerator(settings, false, validateSettings));

    let messages: ReturnType<typeof result.current.generateProblems>;

    act(() => {
      messages = result.current.generateProblems();
    });

    expect(result.current.problems).toHaveLength(2);
    expect(messages.successMessage).toEqual({
      key: 'messages.success.problemsGenerated',
      params: { count: 2 },
    });
  });

  test('should handle validation errors', () => {
    const validateSettings = vi.fn(() => 'errors.noOperations');
    const { result } = renderHook(() => useProblemGenerator(settings, false, validateSettings));

    let messages: ReturnType<typeof result.current.generateProblems>;

    act(() => {
      messages = result.current.generateProblems();
    });

    expect(messages.error).toEqual({ key: 'errors.noOperations' });
  });
});
```

### useEffect Testing Requirements
- **Mock Timers**: Use `vi.useFakeTimers()` for time-dependent effects
- **Test Cleanup**: Verify cleanup functions execute properly
- **Async State Transitions**: Test loading, success, error states
- **Component Unmounting**: Ensure effects handle unmounting gracefully
- **AbortController**: Test request cancellation
- **Race Conditions**: Verify prevention of stale state updates

## Message System Architecture

### MessageValue Type System
```typescript
export type MessageValue = string | MessageState;

export interface MessageState {
  key: string; // Translation key (e.g., 'errors.validation.required')
  params?: Record<string, string | number>; // Optional parameters for interpolation
}
```

### Usage Patterns
```typescript
// ✅ Recommended: MessageState with translation key
setError({ key: 'errors.validation.invalidRange', params: { min: 1, max: 100 } });
setSuccessMessage({ key: 'messages.success.problemsGenerated', params: { count: 20 } });

// ✅ Clear messages
setError({ key: '' });
setWarning({ key: '' });

// ✅ Legacy string support (backward compatibility)
setError('Legacy error message'); // Still supported but not recommended
```

## Hook Composition Guidelines

### When to Use Each Pattern

**Simplified Internal Organization**:
- Single primary concern (e.g., `useProblemGenerator`)
- Focused responsibility
- Internal organization with `useCallback` for performance
- All related logic within the hook

**Modular Helper Hooks**:
- Multiple related concerns (e.g., app-wide state management)
- Complex validation and state management
- Reusable logic across multiple hooks
- Clear separation of concerns

### Benefits of Both Patterns
- **Clear Organization**: Logic is well-structured and easy to follow
- **Performance**: Proper memoization prevents unnecessary re-renders
- **Testability**: Hook functionality can be tested through public APIs
- **Type Safety**: Full TypeScript support with proper dependency tracking
- **Maintainability**: Code is organized for long-term maintenance
- **Flexibility**: Choose the pattern that best fits the hook's complexity

## Hook Dependencies & Memoization

### Dependency Array Best Practices
- Include all values from component scope used inside effect
- Use `useCallback` and `useMemo` to stabilize dependencies
- Extract constants outside component to avoid unnecessary re-runs

```typescript
// ✅ Good: Stable dependencies
const fetchUser = useCallback(async (id: string) => {
  return await api.getUser(id);
}, []);

useEffect(() => {
  fetchUser(userId).then(setUser);
}, [fetchUser, userId]);
```

### Error Boundary Integration
```typescript
useEffect(() => {
  const handleAsync = async () => {
    try {
      const result = await riskyOperation();
      setData(result);
    } catch (error) {
      // Log error and set error state instead of throwing
      console.error('Async operation failed:', error);
      setError(error as Error);
    }
  };
  
  handleAsync();
}, []);
```

This hook architecture ensures MathGenie maintains high code quality, performance, and maintainability while following React 19 best practices and security guidelines.