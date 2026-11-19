import { useCallback, useEffect, useState } from "react";
import { safeStorage } from "@/utils/safeStorage";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "mathgenie-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const readStoredPreference = (): ThemePreference => {
  const stored = safeStorage.get(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
};

const systemPrefersDark = (): boolean => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(DARK_QUERY).matches;
};

/**
 * Manual light/dark/system theme preference.
 * The resolved theme is written to <html data-theme>, which is the single
 * selector all dark tokens key off; an inline script in index.html applies
 * the same resolution before first paint to avoid a flash.
 */
export function useTheme(): {
  preference: ThemePreference;
  resolved: "light" | "dark";
  setPreference: (next: ThemePreference) => void;
} {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference);
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mql = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent): void => setSystemDark(event.matches);
    setSystemDark(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const resolved: "light" | "dark" =
    preference === "system" ? (systemDark ? "dark" : "light") : preference;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
  }, [resolved]);

  const setPreference = useCallback((next: ThemePreference): void => {
    setPreferenceState(next);
    safeStorage.set(STORAGE_KEY, next);
  }, []);

  return { preference, resolved, setPreference };
}

export default useTheme;
