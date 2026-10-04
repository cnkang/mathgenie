import { useCallback, useEffect, useRef, useState } from "react";
import type { MessageValue } from "../types";
export const useAppMessages = () => {
  const [error, setError] = useState<MessageValue>("");
  const [warning, setWarning] = useState<MessageValue>("");
  const [successMessage, setSuccessMessage] = useState<MessageValue>("");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimeoutRef = useCallback(() => {
    if (timeout.current !== null) clearTimeout(timeout.current);
    timeout.current = null;
  }, []);
  useEffect(() => clearTimeoutRef, [clearTimeoutRef]);
  const clearMessages = useCallback(() => {
    clearTimeoutRef();
    setError("");
    setWarning("");
    setSuccessMessage("");
  }, [clearTimeoutRef]);
  const showSuccessMessage = useCallback(
    (message: MessageValue) => {
      clearTimeoutRef();
      setSuccessMessage(message);
      if (message)
        timeout.current = setTimeout(() => {
          setSuccessMessage("");
          timeout.current = null;
        }, 5000);
    },
    [clearTimeoutRef],
  );
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
