/** Storage is optional: private mode, sandbox restrictions and quota errors must not stop practice. */
export const safeStorage = {
  get(key: string): string | null {
    try {
      return globalThis.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): boolean {
    try {
      globalThis.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove(key: string): void {
    try {
      globalThis.localStorage.removeItem(key);
    } catch {
      /* Storage may be unavailable. */
    }
  },
};
