import { useCallback, useState, useTransition } from 'react';

/**
 * Hook for enhanced form handling with React 19.2 concurrent features
 */
export const useFormSubmission = <T extends Record<string, unknown>>(
  action: (formData: FormData) => Promise<void> | void,
  initialState?: T
) => {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<T | undefined>(initialState);

  const handleSubmit = useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        try {
          await action(formData);
        } catch (error) {
          console.error('Form action failed:', error);
        }
      });
    },
    [action]
  );

  return {
    isPending,
    state,
    setState,
    handleSubmit,
  };
};
