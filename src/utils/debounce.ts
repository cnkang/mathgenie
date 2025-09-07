export const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } => {
  let timeoutId: number;
  const debounced = (...args: Parameters<T>): void => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = (): void => {
    window.clearTimeout(timeoutId);
  };
  return debounced;
};
