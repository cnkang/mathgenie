import type { PaperSizeOptions, Problem, Settings } from "@/types";
import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

// Simple mock for jsPDF
const mockJsPDFInstance = {
  setFontSize: vi.fn(),
  setLineWidth: vi.fn(),
  getTextWidth: vi.fn((text: string) => text.length * 6),
  line: vi.fn(),
  internal: { pageSize: { getHeight: () => 1000, getWidth: () => 800 } },
  addPage: vi.fn(),
  setPage: vi.fn(),
  getNumberOfPages: vi.fn(() => mockJsPDFInstance.addPage.mock.calls.length + 1),
  text: vi.fn(),
  splitTextToSize: vi.fn((text: string) => [text]),
  save: vi.fn(),
  addImage: vi.fn(),
};

function MockJsPDF(_options?: any) {
  return mockJsPDFInstance;
}

// Mock the jsPDF module
vi.mock("jspdf", () => {
  return {
    default: MockJsPDF,
  };
});

const paperSizes: PaperSizeOptions = {
  a4: "a4",
  letter: "letter",
  legal: "legal",
};

const baseSettings: Settings = {
  operations: ["+"],
  numProblems: 1,
  numRange: [1, 10],
  resultRange: [1, 10],
  numOperandsRange: [2, 2],
  allowNegative: false,
  showAnswers: false,
  fontSize: 12,
  lineSpacing: 1.5,
  paperSize: "a4",
  enableGrouping: false,
  problemsPerGroup: 20,
  totalGroups: 1,
};

describe("pdf utils", () => {
  beforeEach(() => vi.clearAllMocks());
  test("previews the exact grouped worksheet and saves matching numbered answer pages", async () => {
    const { preparePdf } = await import("./pdf");
    const problems = [
      { id: 4, text: "1 + 2 = 3", correctAnswer: 3 },
      { id: 7, text: "4 × 2 = 8" },
    ];
    const settings = {
      ...baseSettings,
      enableGrouping: true,
      totalGroups: 2,
      problemsPerGroup: 1,
      showAnswers: true,
    };
    const labels = {
      group: (index: number) => `Group ${index}`,
      empty: "Empty",
      answerKey: "Solutions",
    };
    const pdf = await preparePdf(problems, settings, paperSizes, labels, true);

    expect(pdf.pages.map(({ kind, lines }) => [kind, lines.map(({ text }) => text)])).toEqual([
      ["worksheet", ["Group 1", "1. 1 + 2 ="]],
      ["worksheet", ["Group 2", "2. 4 x 2 ="]],
      ["answerKey", ["Solutions", "For parents", "1. 3", "2. 8"]],
    ]);
    expect(mockJsPDFInstance.text.mock.calls).toEqual([
      ...pdf.pages.flatMap(({ studentInfo, lines }) => [
        ...(studentInfo?.lines ?? []).map(({ text, x, y }) => [text, x, y]),
        ...lines.map(({ text, x, y }) => [text, x, y]),
      ]),
      ...pdf.pages.flatMap(({ pageNumber }) =>
        pageNumber ? [[pageNumber.text, pageNumber.x, pageNumber.y]] : [],
      ),
    ]);
    expect(pdf.pages.map(({ answerRules }) => answerRules.length)).toEqual([1, 1, 0]);
    expect(mockJsPDFInstance.line.mock.calls).toEqual(
      pdf.pages.flatMap(({ studentInfo, answerRules, decorativeRules }) => [
        ...(studentInfo?.rules ?? []).map(({ x, y, width }) => [x, y, x + width, y]),
        ...answerRules.map(({ x, y, width }) => [x, y, x + width, y]),
        ...(decorativeRules ?? []).map(({ x, y, width }) => [x, y, x + width, y]),
      ]),
    );
    expect(mockJsPDFInstance.addPage).toHaveBeenCalledTimes(2);
    expect(mockJsPDFInstance.save).not.toHaveBeenCalled();
    pdf.save("problems.pdf");
    expect(mockJsPDFInstance.save).toHaveBeenCalledExactlyOnceWith("problems.pdf");
  });
  test("keeps a wrapped answer line inside its column and skips answered problems", async () => {
    const { preparePdf } = await import("./pdf");
    const longExpression = "1234 + ".repeat(7) + "1234";
    const pdf = await preparePdf(
      [
        { id: 1, text: `${longExpression} = ?` },
        { id: 2, text: "1 + 2 = 3" },
      ],
      baseSettings,
      paperSizes,
      { group: () => "", empty: "" },
      false,
    );

    const { lines, answerRules } = pdf.pages[0];
    expect(lines.map(({ text }) => text)).toEqual([longExpression, "=", "1 + 2 = 3"]);
    expect(answerRules).toEqual([{ x: 39, y: lines[1].y + 1.5, width: 40 }]);
    expect(mockJsPDFInstance.line.mock.calls).toContainEqual([
      39,
      lines[1].y + 1.5,
      79,
      lines[1].y + 1.5,
    ]);
  });
  test("keeps long grouped exports ordered while yielding between batches", async () => {
    const { generatePdf } = await import("./pdf");
    const timeout = vi.spyOn(globalThis, "setTimeout");
    const problems = Array.from({ length: 402 }, (_, id) => ({ id, text: `${id} + 1 =` }));
    await generatePdf(
      problems,
      { ...baseSettings, enableGrouping: true, totalGroups: 2, problemsPerGroup: 201 },
      paperSizes,
    );
    const printed = mockJsPDFInstance.text.mock.calls.map(([text]) => text);
    expect(printed.filter((text: string) => text.endsWith("+ 1 ="))).toEqual(
      problems.map((problem) => problem.text),
    );
    expect(timeout).toHaveBeenCalledWith(expect.any(Function), 0);
    expect(printed.indexOf("Group 2")).toBeGreaterThan(printed.indexOf("200 + 1 ="));
    expect(mockJsPDFInstance.save).toHaveBeenCalledExactlyOnceWith("problems.pdf");
    timeout.mockRestore();
  });
  test("rejects drawing errors in later batches without saving a partial PDF", async () => {
    const { generatePdf } = await import("./pdf");
    const problems = Array.from({ length: 201 }, (_, id) => ({ id, text: `${id} + 1 =` }));
    mockJsPDFInstance.text.mockImplementation((text: string) => {
      if (text === "200 + 1 =") throw new Error("drawing failed");
    });
    await expect(generatePdf(problems, baseSettings, paperSizes)).rejects.toThrow("drawing failed");
    expect(mockJsPDFInstance.save).not.toHaveBeenCalled();
    mockJsPDFInstance.text.mockReset();
  });
  test("wraps long expressions, replaces symbols and paginates within margins", async () => {
    const { generatePdf } = await import("./pdf");
    mockJsPDFInstance.splitTextToSize.mockImplementationOnce(() => Array(100).fill("1 x 2 / 2 ="));
    await generatePdf([{ id: 1, text: "1 ✖ 2 ➗ 2 =" }], baseSettings, paperSizes);
    expect(mockJsPDFInstance.splitTextToSize).toHaveBeenCalledWith("1 x 2 / 2 =", 358);
    expect(mockJsPDFInstance.addPage).toHaveBeenCalled();
    for (const [, x, y] of mockJsPDFInstance.text.mock.calls) {
      expect(x).toBeGreaterThanOrEqual(28);
      expect(y).toBeLessThan(972);
    }
  });
  test("renders localized headings using browser fonts and separates groups", async () => {
    const { generatePdf } = await import("./pdf");
    const context = { measureText: () => ({ width: 120 }), fillText: vi.fn() };
    const createElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag, options) =>
      tag === "canvas"
        ? ({
            getContext: () => context,
            toDataURL: () => "data:image/png;base64,test",
          } as unknown as HTMLCanvasElement)
        : createElement(tag, options),
    );
    await generatePdf(
      [
        { id: 1, text: "1 + 1 =" },
        { id: 2, text: "2 + 2 =" },
      ],
      { ...baseSettings, enableGrouping: true, totalGroups: 2, problemsPerGroup: 1 },
      paperSizes,
      "localized.pdf",
      { group: (index) => `第${index}组`, empty: "没有题目" },
    );
    expect(mockJsPDFInstance.addImage).toHaveBeenCalledTimes(2);
    expect(mockJsPDFInstance.addPage).toHaveBeenCalledTimes(1);
    await generatePdf([], baseSettings, paperSizes, "empty.pdf", {
      group: () => "组",
      empty: "没有题目",
    });
    expect(context.fillText).toHaveBeenCalledWith("没有题目", 3, expect.any(Number));
    vi.restoreAllMocks();
  });
  test.each([
    { fontSize: 5 },
    { fontSize: 73 },
    { fontSize: NaN },
    { lineSpacing: 0 },
    { lineSpacing: 145 },
    { lineSpacing: Infinity },
    { paperSize: "unknown" },
  ])("rejects invalid PDF settings %j", async (patch) => {
    const { generatePdf } = await import("./pdf");
    await expect(
      generatePdf([], { ...baseSettings, ...patch } as Settings, paperSizes),
    ).rejects.toThrow("Invalid PDF settings");
  });
  test("loadJsPDF returns a function", async () => {
    const { loadJsPDF, clearJsPDFCache } = await import("./pdf");
    clearJsPDFCache();
    const jsPDF = await loadJsPDF();
    expect(typeof jsPDF).toBe("function");
    expect(await loadJsPDF()).toBe(jsPDF);
  });

  test("generatePdf executes without errors", async () => {
    const { generatePdf } = await import("./pdf");
    const problems: Problem[] = [{ id: 1, text: "1 + 1 =" }];

    // Test that the function executes without throwing
    await expect(
      generatePdf(problems, baseSettings, paperSizes, "test.pdf"),
    ).resolves.toBeUndefined();
  });

  test("generatePdf handles empty problems array", async () => {
    const { generatePdf } = await import("./pdf");
    const problems: Problem[] = [];

    // Test that the function handles empty array without throwing
    await expect(
      generatePdf(problems, baseSettings, paperSizes, "test.pdf"),
    ).resolves.toBeUndefined();
  });

  test("generatePdf handles different paper sizes", async () => {
    const { generatePdf } = await import("./pdf");
    const problems: Problem[] = [{ id: 1, text: "1 + 1 =" }];

    const letterSettings = { ...baseSettings, paperSize: "letter" as const };
    await expect(
      generatePdf(problems, letterSettings, paperSizes, "test.pdf"),
    ).resolves.toBeUndefined();

    const legalSettings = { ...baseSettings, paperSize: "legal" as const };
    await expect(
      generatePdf(problems, legalSettings, paperSizes, "test.pdf"),
    ).resolves.toBeUndefined();
  });

  test("generatePdf handles grouping settings", async () => {
    const { generatePdf } = await import("./pdf");
    const problems: Problem[] = [
      { id: 1, text: "1 + 1 =" },
      { id: 2, text: "2 + 2 =" },
    ];

    const groupingSettings: Settings = {
      ...baseSettings,
      enableGrouping: true,
      problemsPerGroup: 2,
      totalGroups: 1,
    };

    await expect(generatePdf(problems, groupingSettings, paperSizes)).resolves.toBeUndefined();
  });
});
