export const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: Parameters<T>): void => {
    if (timeoutId !== undefined) {
      globalThis.clearTimeout(timeoutId);
    }
    timeoutId = globalThis.setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = (): void => {
    if (timeoutId !== undefined) {
      globalThis.clearTimeout(timeoutId);
    }
  };
  return debounced;
};
