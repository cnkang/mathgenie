import type { PaperSizeOptions, Problem, Settings } from "@/types";
import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { fireEvent, render, screen, waitFor } from "../../tests/helpers/testUtils";
import { prepareAnswerKeyPdf, preparePdf, type PreparedPdf } from "../utils/pdf";
import PdfPreview from "./PdfPreview";

vi.mock("../utils/pdf", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../utils/pdf")>();
  return {
    ...actual,
    preparePdf: vi.fn(),
    prepareAnswerKeyPdf: vi.fn(),
  };
});

const mockedPreparePdf = vi.mocked(preparePdf);
const mockedPrepareAnswerKeyPdf = vi.mocked(prepareAnswerKeyPdf);

const translations: Record<string, string> = {
  "pdf.previewTitle": "Print preview",
  "pdf.closePreview": "Close",
  "pdf.previewSize": "Preview size",
  "pdf.zoomPage": "Zoom",
  "pdf.fitPage": "Fit",
  "pdf.preparingPreview": "Preparing preview",
  "pdf.worksheet": "Worksheet",
  "pdf.answerKey": "Answer key",
  "pdf.paperSize": "Paper size",
  "pdf.largePrint": "Large print",
  "pdf.largePrintDetails": "{{font}} pt font · {{spacing}} pt line spacing",
  "pdf.fontSize": "Font size",
  "pdf.lineSpacing": "Line spacing",
  "pdf.includeAnswerKey": "Include answer key",
  "pdf.answerKeyHelp": "Adds the answers at the end of the PDF.",
  "pdf.answerKeySubtitle": "For parents",
  "pdf.downloadAnswerKeyOnly": "Download answer key only",
  "pdf.preparingAnswerKey": "Preparing answer key",
  "pdf.pageNumber": "Page number",
  "pdf.goToPage": "Go to page",
  "buttons.download": "Download",
  "results.page": "Page {{page}} of {{pages}}",
  "results.previousPage": "Previous page",
  "results.nextPage": "Next page",
  "errors.pdfFailed": "PDF generation failed",
};

const t = (key: string, params?: Record<string, string | number>): string => {
  let translated = translations[key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      translated = translated.replaceAll(`{{${name}}}`, String(value));
    }
  }
  return translated;
};

const paperSizes: PaperSizeOptions = {
  a4: "a4",
  letter: "letter",
  legal: "legal",
};

const settings: Settings = {
  operations: ["+"],
  numProblems: 2,
  numRange: [1, 10],
  resultRange: [1, 10],
  numOperandsRange: [2, 2],
  allowNegative: false,
  showAnswers: false,
  fontSize: 12,
  lineSpacing: 20,
  paperSize: "a4",
  enableGrouping: false,
  problemsPerGroup: 20,
  totalGroups: 1,
};

const labels = {
  group: (index: number) => `Group ${index}`,
  empty: "No problems",
  name: "Name",
  date: "Date",
  answerKey: "Answer key",
};

const problems: Problem[] = [
  { id: 1, text: "1 + 1 =", correctAnswer: 2 },
  { id: 2, text: "2 + 2 =", correctAnswer: 4 },
];

const worksheetPage = {
  kind: "worksheet" as const,
  lines: [{ text: "1 + 1 =", x: 28, y: 120, size: 12 }],
  answerRules: [{ x: 70, y: 121.5, width: 96 }],
  studentInfo: {
    lines: [{ text: "Name", x: 28, y: 20, size: 12 }],
    rules: [{ x: 60, y: 22, width: 100 }],
  },
  decorativeRules: [{ x: 28, y: 40, width: 544 }],
  pageNumber: { text: "1 / 2", x: 540, y: 770, size: 10 },
};

const secondWorksheetPage = {
  kind: "worksheet" as const,
  lines: [{ text: "2 + 2 =", x: 28, y: 120, size: 12 }],
  answerRules: [],
};

const answerPage = {
  kind: "answerKey" as const,
  lines: [{ text: "1. 2", x: 28, y: 120, size: 12 }],
  answerRules: [],
};

const makePdf = (pages: PreparedPdf["pages"]): PreparedPdf => ({
  width: 600,
  height: 800,
  pages,
  save: vi.fn(),
});

const worksheetPdf = makePdf([worksheetPage, secondWorksheetPage]);
const answersPdf = makePdf([worksheetPage, secondWorksheetPage, answerPage]);

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const defaultProps = () => ({
  t,
  problems,
  settings,
  paperSizes,
  labels,
  onClose: vi.fn(),
  onDownload: vi.fn(async () => {}),
});

const renderPreview = (overrides: Partial<ReturnType<typeof defaultProps>> = {}) => {
  const props = { ...defaultProps(), ...overrides };
  render(<PdfPreview {...props} />);
  return props;
};

describe("PdfPreview", () => {
  beforeEach(() => {
    mockedPreparePdf.mockReset();
    mockedPrepareAnswerKeyPdf.mockReset();
    mockedPreparePdf.mockImplementation(async (_problems, _settings, _sizes, _labels, include) =>
      include ? answersPdf : worksheetPdf,
    );
    mockedPrepareAnswerKeyPdf.mockResolvedValue(answersPdf);
  });

  test("prepares a preview, renders stands and rules, and downloads it", async () => {
    const pending = deferred<PreparedPdf>();
    mockedPreparePdf.mockReturnValueOnce(pending.promise);
    const props = renderPreview();

    expect(screen.getByRole("status")).toHaveTextContent("Preparing preview");

    pending.resolve(worksheetPdf);
    expect(await screen.findByText("1 + 1 =")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByText("Worksheet · Page 1 of 2")).toBeInTheDocument();
    expect(mockedPreparePdf).toHaveBeenCalledWith(
      problems,
      { ...settings },
      paperSizes,
      labels,
      false,
      expect.any(AbortSignal),
    );

    const canvas = document.querySelector(".pdf-preview-canvas");
    expect(canvas?.getAttribute("data-zoomed")).toBe("false");
    fireEvent.click(screen.getByLabelText("Zoom"));
    expect(canvas?.getAttribute("data-zoomed")).toBe("true");
    fireEvent.click(screen.getByLabelText("Fit"));
    expect(canvas?.getAttribute("data-zoomed")).toBe("false");

    const previous = screen.getByRole("button", { name: "Previous page" });
    const next = screen.getByRole("button", { name: "Next page" });
    expect((previous as HTMLButtonElement).disabled).toBe(true);
    expect((next as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(next);
    expect(await screen.findByText("2 + 2 =")).toBeInTheDocument();
    expect(screen.getByText("Worksheet · Page 2 of 2")).toBeInTheDocument();
    expect((screen.getByRole("button", { name: "Next page" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(await screen.findByText("1 + 1 =")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Download" }));
    await waitFor(() => expect(props.onDownload).toHaveBeenCalledWith(worksheetPdf));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  test("jumps between pages and ignores invalid page numbers", async () => {
    renderPreview();
    expect(await screen.findByText("Worksheet · Page 1 of 2")).toBeInTheDocument();

    const input = screen.getByLabelText("Page number") as HTMLInputElement;
    input.value = "2";
    fireEvent.submit(input.form as HTMLFormElement);
    expect(await screen.findByText("Worksheet · Page 2 of 2")).toBeInTheDocument();

    input.value = "99";
    fireEvent.submit(input.form as HTMLFormElement);
    expect(screen.getByText("Worksheet · Page 2 of 2")).toBeInTheDocument();
  });

  test("re-prepares when paper size changes and skips duplicate selections", async () => {
    renderPreview();
    await screen.findByText("1 + 1 =");
    const select = screen.getByLabelText("Paper size") as HTMLSelectElement;

    fireEvent.change(select, { target: { value: "letter" } });
    await waitFor(() =>
      expect(mockedPreparePdf).toHaveBeenLastCalledWith(
        problems,
        expect.objectContaining({ paperSize: "letter" }),
        paperSizes,
        labels,
        false,
        expect.any(AbortSignal),
      ),
    );

    const callsAfterChange = mockedPreparePdf.mock.calls.length;
    fireEvent.change(select, { target: { value: "letter" } });
    fireEvent.change(select, { target: { value: "unknown" } });
    expect(mockedPreparePdf).toHaveBeenCalledTimes(callsAfterChange);
  });

  test("applies large print and validates font and spacing measurements", async () => {
    renderPreview();
    await screen.findByText("1 + 1 =");

    const largePrint = screen.getByRole("button", { name: /Large print/ });
    fireEvent.click(largePrint);
    await waitFor(() =>
      expect(mockedPreparePdf).toHaveBeenLastCalledWith(
        problems,
        expect.objectContaining({ fontSize: 24, lineSpacing: 40 }),
        paperSizes,
        labels,
        false,
        expect.any(AbortSignal),
      ),
    );
    const callsAfterLargePrint = mockedPreparePdf.mock.calls.length;
    fireEvent.click(largePrint);
    expect(mockedPreparePdf).toHaveBeenCalledTimes(callsAfterLargePrint);

    const fontSize = screen.getByLabelText("Font size") as HTMLInputElement;
    fireEvent.change(fontSize, { target: { value: "30" } });
    await waitFor(() =>
      expect(mockedPreparePdf).toHaveBeenLastCalledWith(
        problems,
        expect.objectContaining({ fontSize: 30 }),
        paperSizes,
        labels,
        false,
        expect.any(AbortSignal),
      ),
    );
    const callsAfterFontSize = mockedPreparePdf.mock.calls.length;
    fireEvent.change(fontSize, { target: { value: "30" } });
    fireEvent.change(fontSize, { target: { value: "100" } });
    expect(fontSize.value).toBe("100");
    fireEvent.blur(fontSize);
    expect(fontSize.value).toBe("30");
    expect(mockedPreparePdf).toHaveBeenCalledTimes(callsAfterFontSize);

    const lineSpacing = screen.getByLabelText("Line spacing") as HTMLInputElement;
    fireEvent.change(lineSpacing, { target: { value: "50" } });
    await waitFor(() =>
      expect(mockedPreparePdf).toHaveBeenLastCalledWith(
        problems,
        expect.objectContaining({ lineSpacing: 50 }),
        paperSizes,
        labels,
        false,
        expect.any(AbortSignal),
      ),
    );
    const callsAfterSpacing = mockedPreparePdf.mock.calls.length;
    fireEvent.change(lineSpacing, { target: { value: "50" } });
    fireEvent.change(lineSpacing, { target: { value: "5" } });
    expect(lineSpacing.value).toBe("5");
    fireEvent.blur(lineSpacing);
    expect(lineSpacing.value).toBe("50");
    expect(mockedPreparePdf).toHaveBeenCalledTimes(callsAfterSpacing);
  });

  test("includes answers and opens the answer page", async () => {
    renderPreview();
    await screen.findByText("Worksheet · Page 1 of 2");

    fireEvent.click(screen.getByLabelText("Include answer key"));
    await waitFor(() =>
      expect(mockedPreparePdf).toHaveBeenLastCalledWith(
        problems,
        expect.objectContaining({ paperSize: "a4" }),
        paperSizes,
        labels,
        true,
        expect.any(AbortSignal),
      ),
    );
    expect(await screen.findByText("Answer key · Page 3 of 3")).toBeInTheDocument();
    expect(screen.getByText("1. 2")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Include answer key"));
    await waitFor(() =>
      expect(mockedPreparePdf).toHaveBeenLastCalledWith(
        problems,
        expect.any(Object),
        paperSizes,
        labels,
        false,
        expect.any(AbortSignal),
      ),
    );
  });

  test("shows a preparation error without offering a download", async () => {
    mockedPreparePdf.mockRejectedValueOnce(new Error("generation failed"));
    renderPreview();

    expect(await screen.findByRole("alert")).toHaveTextContent("PDF generation failed");
    expect((screen.getByRole("button", { name: "Download" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect(screen.queryByLabelText("Page number")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next page" })).not.toBeInTheDocument();
  });

  test("ignores a preview that resolves after unmount", async () => {
    const pending = deferred<PreparedPdf>();
    mockedPreparePdf.mockReturnValueOnce(pending.promise);
    const { unmount } = render(<PdfPreview {...defaultProps()} />);
    unmount();
    expect(mockedPreparePdf.mock.calls[0]?.[5]?.aborted).toBe(true);
    pending.resolve(worksheetPdf);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  test("downloads a standalone answer key and blocks duplicate requests", async () => {
    const pending = deferred<PreparedPdf>();
    mockedPrepareAnswerKeyPdf.mockReturnValueOnce(pending.promise);
    const props = renderPreview();
    await screen.findByText("1 + 1 =");

    const button = screen.getByRole("button", { name: "Download answer key only" });
    fireEvent.click(button);
    expect(
      ((await screen.findByRole("button", { name: "Preparing answer key" })) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    fireEvent.click(button);
    expect(mockedPrepareAnswerKeyPdf).toHaveBeenCalledTimes(1);

    pending.resolve(answersPdf);
    await waitFor(() =>
      expect(props.onDownload).toHaveBeenCalledWith(answersPdf, "mathgenie-answer-key.pdf"),
    );
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  test("reports answer key failures and allows retrying", async () => {
    mockedPrepareAnswerKeyPdf.mockRejectedValueOnce(new Error("answer key failed"));
    const props = renderPreview();
    await screen.findByText("1 + 1 =");

    fireEvent.click(screen.getByRole("button", { name: "Download answer key only" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("PDF generation failed");
    expect(
      (screen.getByRole("button", { name: "Download answer key only" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
    expect(props.onDownload).not.toHaveBeenCalled();
  });

  test("aborts an answer key download when the preview closes", async () => {
    const pending = deferred<PreparedPdf>();
    mockedPrepareAnswerKeyPdf.mockReturnValueOnce(pending.promise);
    const props = renderPreview();
    await screen.findByText("1 + 1 =");

    fireEvent.click(screen.getByRole("button", { name: "Download answer key only" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(props.onClose).toHaveBeenCalledTimes(1);

    pending.resolve(answersPdf);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(props.onDownload).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("disables answer key export when there are no problems", async () => {
    renderPreview({ problems: [] });
    await screen.findByText("Preparing preview");
    expect(
      (screen.getByRole("button", { name: "Download answer key only" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });
});
