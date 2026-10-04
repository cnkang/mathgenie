import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { defaultSettings } from "@/domain/settings";
import { safeEvaluateExpression } from "@/domain/expression";
afterEach(() => vi.unstubAllGlobals());
describe("generation worker", () => {
  it("validates messages and emits progress and structurally correct problems", async () => {
    const postMessage = vi.fn();
    const scope: { postMessage: typeof postMessage; onmessage?: (event: MessageEvent) => void } = {
      postMessage,
    };
    vi.stubGlobal("self", scope);
    await import("./generation.worker");
    scope.onmessage?.({ data: {} } as MessageEvent);
    expect(postMessage).toHaveBeenLastCalledWith({ error: "errors.noOperations" });
    scope.onmessage?.({
      data: {
        ...defaultSettings,
        numProblems: 250,
        operations: ["+"],
        numRange: [1, 10],
        resultRange: [0, 100],
      },
    } as MessageEvent);
    const output = postMessage.mock.calls.at(-1)?.[0];
    expect(output.progress).toBe(100);
    expect(output.problems).toHaveLength(250);
    for (const problem of output.problems)
      expect(safeEvaluateExpression(problem.text.split("=")[0])).toBe(problem.correctAnswer);
    expect(postMessage).toHaveBeenCalledWith({ progress: 0 });
    vi.spyOn(crypto, "getRandomValues").mockImplementation(() => {
      throw new Error("unavailable");
    });
    scope.onmessage?.({ data: defaultSettings } as MessageEvent);
    expect(postMessage).toHaveBeenLastCalledWith({ error: "errors.generationFailed" });
    vi.restoreAllMocks();
  });
});
