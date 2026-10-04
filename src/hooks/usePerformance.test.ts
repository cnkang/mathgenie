import { act, renderHook } from "@testing-library/react";
import { expect, it } from "vite-plus/test";
import { usePerformanceTracking } from "./usePerformance";
it("reports measured render durations and timestamps rather than placeholder values", () => {
  const { result } = renderHook(() => usePerformanceTracking());
  expect(result.current.performanceMetrics.averageRenderTime).toBe(0);
  expect(result.current.performanceMetrics.lastRenderTime).toBe(0);
  act(() => {
    result.current.trackRender(4);
    result.current.trackRender(10);
  });
  expect(result.current.performanceMetrics.renderCount).toBe(2);
  expect(result.current.performanceMetrics.averageRenderTime).toBe(7);
  expect(result.current.performanceMetrics.lastRenderTime).toBeGreaterThan(0);
});
