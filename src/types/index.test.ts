import type {
  DeepPartial,
  Language,
  Operation,
  OptimisticState,
  PaperSize,
  Problem,
  Settings,
} from "./index";

describe("Type Definitions", () => {
  test("Operation type should accept valid operations", () => {
    const validOperations: Operation[] = ["+", "-", "*", "/"];
    expect(validOperations).toHaveLength(4);
  });

  test("PaperSize type should accept valid paper sizes", () => {
    const validSizes: PaperSize[] = ["a4", "letter", "legal"];
    expect(validSizes).toHaveLength(3);
  });

  test("Settings interface should have correct structure", () => {
    const settings: Settings = {
      operations: ["+", "-"],
      numProblems: 10,
      numRange: [1, 10],
      resultRange: [0, 20],
      numOperandsRange: [2, 3],
      allowNegative: false,
      showAnswers: true,
      fontSize: 12,
      lineSpacing: 14,
      paperSize: "a4",
    };

    expect(settings.operations).toEqual(["+", "-"]);
    expect(settings.numProblems).toBe(10);
    expect(settings.numRange).toEqual([1, 10]);
    expect(settings.allowNegative).toBe(false);
  });

  test("Problem interface should have correct structure", () => {
    const problem: Problem = {
      id: 1,
      text: "2 + 3 = ?",
    };

    expect(problem.id).toBe(1);
    expect(problem.text).toBe("2 + 3 = ?");
  });

  test("Language interface should have correct structure", () => {
    const language: Language = {
      code: "en",
      name: "English",
      flag: "🇺🇸",
    };

    expect(language.code).toBe("en");
    expect(language.name).toBe("English");
    expect(language.flag).toBe("🇺🇸");
  });

  test("OptimisticState should work with different types", () => {
    const stringState: OptimisticState<string> = {
      current: "current",
      pending: "pending",
      isPending: true,
    };

    const numberState: OptimisticState<number> = {
      current: 1,
      pending: null,
      isPending: false,
    };

    expect(stringState.current).toBe("current");
    expect(stringState.pending).toBe("pending");
    expect(stringState.isPending).toBe(true);

    expect(numberState.current).toBe(1);
    expect(numberState.pending).toBeNull();
    expect(numberState.isPending).toBe(false);
  });

  test("DeepPartial should make all properties optional", () => {
    const partialSettings: DeepPartial<Settings> = {
      operations: ["+"],
      numProblems: 5,
      // Other properties are optional
    };

    expect(partialSettings.operations).toEqual(["+"]);
    expect(partialSettings.numProblems).toBe(5);
    expect(partialSettings.allowNegative).toBeUndefined();
  });
});
