import { useRef, useState } from 'react';
import type { MessageValue } from '../types';

interface UseAppMessagesReturn {
  error: MessageValue;
  warning: MessageValue;
  successMessage: MessageValue;
  setError: (error: MessageValue) => void;
  setWarning: (warning: MessageValue) => void;
  setSuccessMessage: (message: MessageValue) => void;
  clearMessages: () => void;
  showSuccessMessage: (message: MessageValue) => void;
}

export const useAppMessages = (): UseAppMessagesReturn => {
  const [error, setError] = useState<MessageValue>('');
  const [warning, setWarning] = useState<MessageValue>('');
  const [successMessage, setSuccessMessage] = useState<MessageValue>('');
  const timeoutRef = useRef<number | null>(null);

  const clearMessages = (): void => {
    setError('');
    setWarning('');
    setSuccessMessage('');
  };

  const showSuccessMessage = (message: MessageValue): void => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setSuccessMessage(message);
    timeoutRef.current = window.setTimeout(() => setSuccessMessage(''), 5000);
  };

  return {
    error,
    warning,
    successMessage,
    setError,
    setWarning,
    setSuccessMessage,
    clearMessages,
    showSuccessMessage,
  };
};
