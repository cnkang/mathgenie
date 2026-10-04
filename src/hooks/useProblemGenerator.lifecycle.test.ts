import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { defaultSettings } from "@/domain/settings";
import { useProblemGenerator } from "./useProblemGenerator";
import { validateSettings } from "@/domain/settings";
class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage?: (event: MessageEvent) => void;
  onerror?: () => void;
  terminate = vi.fn();
  postMessage = vi.fn();
  constructor() {
    FakeWorker.instances.push(this);
  }
  send(data: unknown) {
    this.onmessage?.({ data } as MessageEvent);
  }
}
afterEach(() => {
  vi.unstubAllGlobals();
  FakeWorker.instances = [];
});
describe("generation sessions", () => {
  it.each([{ fontSize: 0 }, { lineSpacing: 0 }])(
    "retries pending generation after invalid PDF settings are corrected %j",
    (overrides) => {
      const initial = { ...defaultSettings, numProblems: 2 };
      const { result, rerender } = renderHook(
        ({ settings }) => useProblemGenerator(settings, false, validateSettings),
        { initialProps: { settings: initial } },
      );
      const previous = result.current.problems;
      rerender({ settings: { ...initial, ...overrides, numProblems: 3 } });
      expect(result.current.messages.error).toEqual({ key: "errors.pdfFailed" });
      expect(result.current.problems).toEqual(previous);
      rerender({ settings: { ...initial, numProblems: 3 } });
      expect(result.current.messages.error).toBe("");
      expect(result.current.problems).toHaveLength(3);
      const generated = result.current.problems;
      rerender({ settings: { ...initial, numProblems: 3, fontSize: 18 } });
      expect(result.current.problems).toBe(generated);
    },
  );
  it("generates after correcting initially invalid PDF settings", () => {
    const invalid = { ...defaultSettings, numProblems: 2, fontSize: 0 };
    const { result, rerender } = renderHook(
      ({ settings }) => useProblemGenerator(settings, false, validateSettings),
      { initialProps: { settings: invalid } },
    );
    expect(result.current.problems).toHaveLength(0);
    rerender({ settings: { ...invalid, fontSize: 16 } });
    expect(result.current.problems).toHaveLength(2);
    expect(result.current.messages.error).toBe("");
  });
  it("restarts cancelled initial work when StrictMode remounts effects", () => {
    vi.stubGlobal("Worker", FakeWorker);
    const { result } = renderHook(
      () => useProblemGenerator({ ...defaultSettings, numProblems: 300 }, false, validateSettings),
      { reactStrictMode: true },
    );
    expect(FakeWorker.instances).toHaveLength(2);
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalled();
    act(() =>
      FakeWorker.instances[1].send({ problems: [{ id: 0, text: "1 + 1 = ", correctAnswer: 2 }] }),
    );
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.problems).toHaveLength(1);
  });
  it("contains worker startup failures without freezing or throwing", () => {
    vi.stubGlobal(
      "Worker",
      class {
        constructor() {
          throw new Error("blocked");
        }
      },
    );
    const { result } = renderHook(() =>
      useProblemGenerator({ ...defaultSettings, numProblems: 300 }, false, validateSettings),
    );
    expect(result.current.messages.error).toEqual({ key: "errors.generationFailed" });
    expect(result.current.isGenerating).toBe(false);
  });
  it("does not redraw problems for paper, font, answer display or language loading", () => {
    const initial = { ...defaultSettings, numProblems: 2 };
    const { result, rerender } = renderHook(
      ({ settings, loading }) => useProblemGenerator(settings, loading, validateSettings),
      { initialProps: { settings: initial, loading: false } },
    );
    const answers = result.current.problems.map(({ operands }) => operands);
    rerender({
      settings: { ...initial, fontSize: 18, paperSize: "letter", showAnswers: true },
      loading: false,
    });
    expect(result.current.problems.map(({ operands }) => operands)).toEqual(answers);
    expect(result.current.problems[0].text).not.toMatch(/= $/);
    rerender({ settings: initial, loading: true });
    rerender({ settings: initial, loading: false });
    expect(result.current.problems.map(({ operands }) => operands)).toEqual(answers);
  });
  it("tracks worker progress, ignores cancelled replies, completes current work", () => {
    vi.stubGlobal("Worker", FakeWorker);
    const { result } = renderHook(() =>
      useProblemGenerator({ ...defaultSettings, numProblems: 50000 }, false, validateSettings),
    );
    const first = FakeWorker.instances[0];
    act(() => first.send({ progress: 20 }));
    expect(result.current.progress).toBe(20);
    act(() => result.current.generateProblems());
    const second = FakeWorker.instances[1];
    expect(first.terminate).toHaveBeenCalled();
    act(() => first.send({ problems: [{ id: 0, text: "stale" }] }));
    expect(result.current.problems).toHaveLength(0);
    act(() =>
      second.send({ progress: 100, problems: [{ id: 0, text: "1 + 1 = ", correctAnswer: 2 }] }),
    );
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.problems[0].correctAnswer).toBe(2);
    expect(result.current.messages.warning).toMatchObject({ key: "errors.partialGeneration" });
  });
  it("reports worker errors and terminates on unmount", () => {
    vi.stubGlobal("Worker", FakeWorker);
    const settings = { ...defaultSettings, numProblems: 300 };
    const { result, unmount } = renderHook(() =>
      useProblemGenerator(settings, false, validateSettings),
    );
    act(() => FakeWorker.instances[0].send({ error: "errors.generationFailed" }));
    expect(result.current.messages.error).toEqual({ key: "errors.generationFailed" });
    act(() => result.current.generateProblems());
    act(() => FakeWorker.instances[1].onerror?.());
    expect(result.current.isGenerating).toBe(false);
    act(() => result.current.generateProblems());
    unmount();
    expect(FakeWorker.instances[2].terminate).toHaveBeenCalled();
  });
  it("keeps previous problems when new constraints cannot produce any", () => {
    const initial = { ...defaultSettings, numProblems: 2 };
    const { result, rerender } = renderHook(
      ({ settings }) => useProblemGenerator(settings, false, validateSettings),
      { initialProps: { settings: initial } },
    );
    const previous = result.current.problems;
    rerender({
      settings: { ...initial, operations: ["+"], numRange: [1, 1], resultRange: [100, 200] },
    });
    expect(result.current.problems).toEqual(previous);
    act(() => result.current.generateProblems());
    expect(result.current.messages.error).toMatchObject({ key: "errors.noProblemsGenerated" });
  });
});
