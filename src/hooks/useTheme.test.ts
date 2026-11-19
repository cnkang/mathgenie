import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { useTheme } from "./useTheme";

type ChangeListener = (event: { matches: boolean }) => void;

const installMatchMedia = (initial: boolean) => {
  const listeners = new Set<ChangeListener>();
  const state = { matches: initial };
  window.matchMedia = vi.fn((query: string) => ({
    matches: state.matches,
    media: query,
    onchange: null,
    addEventListener: (_event: string, listener: ChangeListener) => {
      listeners.add(listener);
    },
    removeEventListener: (_event: string, listener: ChangeListener) => {
      listeners.delete(listener);
    },
    addListener: (listener: ChangeListener) => listeners.add(listener),
    removeListener: (listener: ChangeListener) => listeners.delete(listener),
    dispatchEvent: () => true,
  })) as unknown as typeof window.matchMedia;
  return {
    emit(matches: boolean) {
      state.matches = matches;
      for (const listener of listeners) listener({ matches });
    },
  };
};

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  localStorage.removeItem("mathgenie-theme");
  document.documentElement.removeAttribute("data-theme");
  vi.restoreAllMocks();
});

describe("useTheme", () => {
  it("defaults to system and resolves from the media query", () => {
    const media = installMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe("system");
    expect(result.current.resolved).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    act(() => media.emit(false));
    expect(result.current.resolved).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("persists an explicit preference and overrides the system", () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setPreference("light"));
    expect(result.current.resolved).toBe("light");
    expect(localStorage.getItem("mathgenie-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("restores a stored preference on mount", () => {
    localStorage.setItem("mathgenie-theme", "dark");
    installMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe("dark");
    expect(result.current.resolved).toBe("dark");
  });

  it("ignores invalid stored values", () => {
    localStorage.setItem("mathgenie-theme", "neon");
    installMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current.preference).toBe("system");
    expect(result.current.resolved).toBe("light");
  });
});
