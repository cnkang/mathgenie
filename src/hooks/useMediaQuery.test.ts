import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { useMediaQuery } from "./useMediaQuery";

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
    state,
    emit(matches: boolean) {
      state.matches = matches;
      for (const listener of listeners) listener({ matches });
    },
  };
};

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

describe("useMediaQuery", () => {
  it("returns the initial match state and tracks changes", () => {
    const media = installMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(max-width: 768px)"));
    expect(result.current).toBe(false);

    act(() => media.emit(true));
    expect(result.current).toBe(true);

    act(() => media.emit(false));
    expect(result.current).toBe(false);
  });

  it("starts true when the query already matches", () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery("(max-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("returns false when matchMedia is unavailable", () => {
    (window as unknown as { matchMedia?: unknown }).matchMedia = undefined;
    const { result } = renderHook(() => useMediaQuery("(max-width: 768px)"));
    expect(result.current).toBe(false);
  });
});
