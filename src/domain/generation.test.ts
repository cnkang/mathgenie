import { describe, expect, it, vi } from "vite-plus/test";
import { defaultSettings } from "./settings";
import {
  createGenerationOutcome,
  generateStructuredProblem,
  evaluateGeneratedProblems,
} from "./generation";
describe("bounded generation", () => {
  it.each([
    { operations: ["+"], numRange: [1, 1], resultRange: [10, 20] },
    { operations: ["/"], numRange: [0, 0] },
    { operations: ["*"], numRange: [2, 2], resultRange: [0, 1] },
    { operations: ["-"], numRange: [-1, -1], resultRange: [-10, -1] },
  ])("returns no problem when constraints are impossible %j", (overrides) => {
    expect(
      generateStructuredProblem(
        { ...defaultSettings, ...overrides, numOperandsRange: [2, 2] } as typeof defaultSettings,
        10,
      ),
    ).toBeNull();
  });
  it("supports groups and generation errors without corrupting the previous result", () => {
    const setProblems = vi.fn();
    const outcome = createGenerationOutcome({
      settings: {
        ...defaultSettings,
        operations: ["+"],
        numRange: [1, 1],
        numOperandsRange: [2, 2],
        enableGrouping: true,
        problemsPerGroup: 2,
        totalGroups: 2,
      },
      showSuccessMessage: true,
      setProblems,
    });
    expect(setProblems.mock.calls[0][0]).toHaveLength(4);
    expect(outcome.successMessage).toMatchObject({ key: "messages.success.problemsGenerated" });
    const crypto = vi.spyOn(globalThis.crypto, "getRandomValues").mockImplementation(() => {
      throw new Error("crypto failed");
    });
    expect(
      createGenerationOutcome({ settings: defaultSettings, showSuccessMessage: true, setProblems })
        .error,
    ).toEqual({ key: "errors.generationFailed" });
    expect(
      createGenerationOutcome({ settings: defaultSettings, showSuccessMessage: false, setProblems })
        .error,
    ).toBe("");
    crypto.mockRestore();
  });
  it("distinguishes empty, partial, quiet and successful batches", () => {
    const problem = { id: 0, text: "1+1 = ", correctAnswer: 2 };
    expect(evaluateGeneratedProblems([], 1, true).error).toMatchObject({
      key: "errors.noProblemsGenerated",
    });
    expect(evaluateGeneratedProblems([problem], 2, true).warning).toMatchObject({
      key: "errors.partialGeneration",
    });
    expect(evaluateGeneratedProblems([problem], 2, false).warning).toBe("");
    expect(evaluateGeneratedProblems([], 1, false).error).toBe("");
  });
});
