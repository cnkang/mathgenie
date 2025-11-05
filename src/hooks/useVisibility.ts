import { useCallback, useState } from 'react';

/**
 * Hook for managing component visibility state
 * Provides similar functionality to React 19.2's Activity component concept
 */
export const useVisibility = (initialVisible: boolean = true) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isHidden, setIsHidden] = useState(!initialVisible);

  const show = useCallback(() => {
    setIsVisible(true);
    setIsHidden(false);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
    setIsHidden(true);
  }, []);

  const toggle = useCallback(() => {
    setIsVisible(prev => !prev);
    setIsHidden(prev => !prev);
  }, []);

  return {
    isVisible,
    isHidden,
    show,
    hide,
    toggle,
  };
};
