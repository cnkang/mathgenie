import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { useCountUp } from "./useCountUp";

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

const mockReducedMotion = (reduced: boolean): void => {
  window.matchMedia = vi.fn((query: string) => ({
    matches: reduced && query.includes("reduce"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
};

describe("useCountUp", () => {
  it("returns the target immediately under reduced motion", () => {
    mockReducedMotion(true);
    const { result } = renderHook(() => useCountUp(100));
    expect(result.current).toBe(100);
  });

  it("starts at zero and animates toward the target", () => {
    mockReducedMotion(false);
    let frameCallback: FrameRequestCallback | null = null;
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation((callback) => {
      frameCallback = callback;
      return 1;
    });
    vi.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {});
    const nowSpy = vi.spyOn(performance, "now").mockReturnValue(0);

    const { result } = renderHook(() => useCountUp(100, 600));
    expect(result.current).toBe(0);

    // Midpoint frame: ease-out cubic at p=0.5 -> 0.875 -> 88.
    act(() => {
      nowSpy.mockReturnValue(300);
      frameCallback?.(300);
    });
    expect(result.current).toBe(88);

    // Final frame clamps to the exact target.
    act(() => {
      nowSpy.mockReturnValue(700);
      frameCallback?.(700);
    });
    expect(result.current).toBe(100);
  });
});
