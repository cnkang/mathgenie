import { safeEvaluateExpression } from "@/domain/expression";
import type { PaperSizeOptions, Problem, Settings } from "@/types";
import { splitProblemsIntoGroups } from "@/utils/groupingUtils";
import type { jsPDF } from "jspdf";
let modulePromise: Promise<typeof import("jspdf").default> | null = null;
export const clearJsPDFCache = (): void => {
  modulePromise = null;
};
export const loadJsPDF = async (): Promise<typeof import("jspdf").default> => {
  modulePromise ??= import("jspdf")
    .then((module) => module.default)
    .catch((error: unknown) => {
      modulePromise = null;
      throw error;
    });
  return modulePromise;
};
export interface PdfLabels {
  group: (index: number, empty: boolean) => string;
  empty: string;
  name?: string;
  date?: string;
  answerKey?: string;
  answerKeySubtitle?: string;
}

export interface PdfLine {
  text: string;
  x: number;
  y: number;
  size: number;
}

interface PdfAnswerRule {
  x: number;
  y: number;
  width: number;
}

interface PdfStudentInfo {
  lines: PdfLine[];
  rules: PdfAnswerRule[];
}

interface PdfPage {
  kind: "worksheet" | "answerKey";
  lines: PdfLine[];
  answerRules: PdfAnswerRule[];
  studentInfo?: PdfStudentInfo;
  pageNumber?: PdfLine;
  decorativeRules?: PdfAnswerRule[];
}

export interface PreparedPdf {
  width: number;
  height: number;
  pages: PdfPage[];
  save: (filename: string) => void;
}

export const PDF_FONT_SIZE_RANGE = { min: 6, max: 72 } as const;
export const PDF_MAX_LINE_SPACING = 144;
export const getMinimumPdfLineSpacing = (fontSize: number): number => fontSize * 1.25;

const defaultLabels: PdfLabels = {
  group: (index, empty) => `Group ${index}${empty ? " (no problems)" : ""}`,
  empty: "No problems are available.",
  name: "Name",
  date: "Date",
  answerKey: "Answer key",
  answerKeySubtitle: "For parents",
};
const printable = (text: string): string => text.replaceAll(/[✖×]/g, "x").replaceAll(/[➗÷]/g, "/");
/** Browser fonts cover CJK headings; arithmetic remains selectable PDF text. */
const drawHeading = (doc: jsPDF, text: string, x: number, y: number, size: number): number => {
  if (/^[\\x20-\\x7E]*$/.test(text)) {
    doc.text(text, x, y);
    return doc.getTextWidth(text);
  }
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to render PDF heading");
  context.font = `${size * 3}px sans-serif`;
  canvas.width = Math.ceil(context.measureText(text).width) + 6;
  canvas.height = Math.ceil(size * 4);
  context.font = `${size * 3}px sans-serif`;
  context.textBaseline = "middle";
  context.fillText(text, 3, canvas.height / 2);
  doc.addImage(
    canvas.toDataURL("image/png"),
    "PNG",
    x,
    y - size,
    canvas.width / 3,
    canvas.height / 3,
  );
  return canvas.width / 3;
};
const createPdfWriter = (
  doc: jsPDF,
  settings: Settings,
  pages?: PdfPage[],
  labels: PdfLabels = defaultLabels,
) => {
  const margin = 28;
  const width = doc.internal.pageSize.getWidth();
  const bottom = doc.internal.pageSize.getHeight() - margin;
  const columnWidth = (width - 3 * margin) / 2;
  const spacing = Math.max(settings.lineSpacing, getMinimumPdfLineSpacing(settings.fontSize));
  const ruleWidth = Math.min(96, Math.max(40, settings.fontSize * 2.5));
  const ruleGap = Math.max(5, settings.fontSize * 0.15);
  let positions = [margin + settings.fontSize, margin + settings.fontSize];
  let kind: PdfPage["kind"] = "worksheet";
  const record = (text: string, x: number, y: number, size: number) => {
    pages?.at(-1)?.lines.push({ text, x, y, size });
  };
  const studentInfo = () => {
    if (kind !== "worksheet") return;
    const page = pages?.at(-1);
    if (page) page.studentInfo = { lines: [], rules: [] };

    const size = Math.min(settings.fontSize, 13);
    const y = margin + size;
    const starts = [margin, margin + columnWidth + margin];
    const fieldLabels = [
      labels.name ?? defaultLabels.name ?? "Name",
      labels.date ?? defaultLabels.date ?? "Date",
    ];
    doc.setFontSize(size);
    for (const [index, label] of fieldLabels.entries()) {
      const x = starts[index];
      const labelWidth = drawHeading(doc, label, x, y, size);
      const rule = {
        x: x + labelWidth + 8,
        y: y + 2,
        width: Math.max(0, columnWidth - labelWidth - 8),
      };
      doc.line(rule.x, rule.y, rule.x + rule.width, rule.y);
      page?.studentInfo?.lines.push({ text: label, x, y, size });
      page?.studentInfo?.rules.push(rule);
    }
    const firstProblemY = y + Math.max(18, size * 1.6);
    positions = positions.map(() => firstProblemY);
    doc.setFontSize(settings.fontSize);
  };
  const answerKeyHeader = () => {
    const title = labels.answerKey ?? defaultLabels.answerKey ?? "Answer key";
    const subtitle = labels.answerKeySubtitle ?? defaultLabels.answerKeySubtitle ?? "For parents";
    const page = pages?.at(-1);
    const titleSize = Math.min(Math.max(settings.fontSize + 6, 22), 28);
    const subtitleSize = Math.min(settings.fontSize, 12);
    const titleY = margin + titleSize;
    const subtitleY = titleY + subtitleSize + 8;

    doc.setFontSize(titleSize);
    drawHeading(doc, title, margin, titleY, titleSize);
    record(title, margin, titleY, titleSize);
    doc.setFontSize(subtitleSize);
    drawHeading(doc, subtitle, margin, subtitleY, subtitleSize);
    record(subtitle, margin, subtitleY, subtitleSize);

    const separator = { x: margin, y: subtitleY + 10, width: width - 2 * margin };
    doc.setLineWidth(1.25);
    doc.line(separator.x, separator.y, separator.x + separator.width, separator.y);
    doc.setLineWidth(0.75);
    if (page) page.decorativeRules = [separator];

    const firstAnswerY = separator.y + Math.max(24, spacing * 1.25);
    positions = positions.map(() => firstAnswerY);
    doc.setFontSize(settings.fontSize);
  };
  const beginAnswerKey = () => {
    kind = "answerKey";
    answerKeyHeader();
  };

  const newPage = (nextKind = kind) => {
    doc.addPage();
    kind = nextKind;
    pages?.push({ kind, lines: [], answerRules: [] });
    positions = [margin + settings.fontSize, margin + settings.fontSize];
    studentInfo();
    if (kind === "answerKey") answerKeyHeader();
  };
  const heading = (text: string, size = settings.fontSize + 2) => {
    doc.setFontSize(size);
    drawHeading(doc, text, margin, positions[0], size);
    record(text, margin, positions[0], size);
    positions = positions.map((position) => position + spacing * 2);
    doc.setFontSize(settings.fontSize);
  };
  const problem = (item: Problem, index: number) => {
    const column = index % 2;
    const text = printable(item.text);
    const blank = text.trimEnd().replace(/\\?$/, "").trimEnd();
    const needsRule = kind === "worksheet" && blank.endsWith("=");
    const lines = doc.splitTextToSize(needsRule ? blank : text, columnWidth) as string[];
    const lastLine = lines.at(-1);
    if (needsRule && lastLine && doc.getTextWidth(lastLine) + ruleGap + ruleWidth > columnWidth) {
      lines[lines.length - 1] = lastLine.slice(0, -1).trimEnd();
      lines.push("=");
    }
    const x = margin + column * (columnWidth + margin);
    const rowSpacing =
      kind === "answerKey" ? spacing + Math.min(6, settings.fontSize * 0.25) : spacing;
    for (const [lineIndex, line] of lines.entries()) {
      if (positions[column] + rowSpacing > bottom) newPage();
      const y = positions[column];
      doc.text(line, x, y);
      record(line, x, y, settings.fontSize);
      if (needsRule && lineIndex === lines.length - 1) {
        const rule = { x: x + doc.getTextWidth(line) + ruleGap, y: y + 1.5, width: ruleWidth };
        doc.line(rule.x, rule.y, rule.x + rule.width, rule.y);
        pages?.at(-1)?.answerRules.push(rule);
      }
      positions[column] += rowSpacing;
    }
  };
  return { newPage, studentInfo, heading, problem, beginAnswerKey };
};

const renderProblemBatches = (
  problems: Problem[],
  render: (problem: Problem, index: number) => void,
  signal?: AbortSignal,
  start = 0,
): Promise<void> => {
  signal?.throwIfAborted();
  const end = Math.min(start + 200, problems.length);
  for (let index = start; index < end; index++) render(problems[index], index);
  if (end === problems.length) return Promise.resolve();
  // Continue after yielding; promise chaining preserves ordering and propagates drawing errors.
  return new Promise<void>((resolve) => setTimeout(resolve, 0)).then(() =>
    renderProblemBatches(problems, render, signal, end),
  );
};
const renderGroups = (
  groups: Problem[][],
  writer: ReturnType<typeof createPdfWriter>,
  groupLabel: PdfLabels["group"] | undefined,
  signal?: AbortSignal,
  index = 0,
): Promise<void> => {
  signal?.throwIfAborted();
  if (index === groups.length) return Promise.resolve();
  if (index > 0) writer.newPage();
  if (groupLabel) writer.heading(groupLabel(index + 1, !groups[index].length));
  return renderProblemBatches(groups[index], writer.problem, signal).then(() =>
    renderGroups(groups, writer, groupLabel, signal, index + 1),
  );
};

const renderAnswerKey = async (
  groups: Problem[][],
  writer: ReturnType<typeof createPdfWriter>,
  labels: PdfLabels,
  grouped: boolean,
  signal?: AbortSignal,
  answerKeyOnly = false,
): Promise<void> => {
  const worksheet: Problem[][] = [];
  const answers: Problem[] = [];
  for (const group of groups) {
    worksheet.push(
      group.map((problem) => {
        const expression = problem.text.split("=").at(0)?.trim() ?? "";
        const answer = problem.correctAnswer ?? safeEvaluateExpression(expression);
        const number = answers.length + 1;
        if (!Number.isFinite(answer)) throw new Error("Invalid problem answer");
        answers.push({ id: number, text: `${number}. ${answer}` });
        return { id: number, text: `${number}. ${expression} =` };
      }),
    );
  }

  if (!answerKeyOnly) {
    await renderGroups(worksheet, writer, grouped ? labels.group : undefined, signal);
  }
  signal?.throwIfAborted();
  if (answers.length === 0) return;
  if (!answerKeyOnly) writer.newPage("answerKey");
  await renderProblemBatches(answers, writer.problem, signal);
};

const addPdfPageNumbers = (doc: jsPDF, fontSize: number, pages?: PdfPage[]) => {
  const pageCount = doc.getNumberOfPages();
  const margin = 28;
  const size = Math.min(fontSize, 10);
  doc.setFontSize(size);
  for (let index = 0; index < pageCount; index += 1) {
    doc.setPage(index + 1);
    const text = `${index + 1} / ${pageCount}`;
    const x = doc.internal.pageSize.getWidth() - margin - doc.getTextWidth(text);
    const y = doc.internal.pageSize.getHeight() - margin - 2;
    doc.text(text, x, y);
    const page = pages?.[index];
    if (page) page.pageNumber = { text, x, y, size };
  }
  doc.setFontSize(fontSize);
};
const createPdfDocument = async (
  problems: Problem[],
  settings: Settings,
  paperSizes: PaperSizeOptions,
  labels: PdfLabels,
  preview?: {
    pages: PdfPage[];
    answerKey: boolean;
    answerKeyOnly?: boolean;
    signal?: AbortSignal;
  },
): Promise<jsPDF> => {
  if (
    !Number.isFinite(settings.fontSize) ||
    settings.fontSize < PDF_FONT_SIZE_RANGE.min ||
    settings.fontSize > PDF_FONT_SIZE_RANGE.max ||
    !Number.isFinite(settings.lineSpacing) ||
    settings.lineSpacing <= 0 ||
    settings.lineSpacing > PDF_MAX_LINE_SPACING ||
    !paperSizes[settings.paperSize]
  )
    throw new Error("Invalid PDF settings");
  const JsPDF = await loadJsPDF();
  preview?.signal?.throwIfAborted();
  const doc = new JsPDF({ format: paperSizes[settings.paperSize], unit: "pt" });
  doc.setFontSize(settings.fontSize);
  doc.setLineWidth(0.75);
  const writer = createPdfWriter(doc, settings, preview?.pages, labels);
  if (problems.length) {
    if (preview?.answerKeyOnly) writer.beginAnswerKey();
    else writer.studentInfo();
    const groups = splitProblemsIntoGroups(problems, settings);
    if (preview?.answerKey || preview?.answerKeyOnly) {
      await renderAnswerKey(
        groups,
        writer,
        labels,
        settings.enableGrouping,
        preview.signal,
        preview.answerKeyOnly,
      );
    } else {
      await renderGroups(
        groups,
        writer,
        settings.enableGrouping ? labels.group : undefined,
        preview?.signal,
      );
    }
  } else {
    writer.heading(labels.empty, settings.fontSize);
  }
  preview?.signal?.throwIfAborted();
  addPdfPageNumbers(doc, settings.fontSize, preview?.pages);
  return doc;
};

export const preparePdf = async (
  problems: Problem[],
  settings: Settings,
  paperSizes: PaperSizeOptions,
  labels: PdfLabels,
  answerKey: boolean,
  signal?: AbortSignal,
  answerKeyOnly = false,
): Promise<PreparedPdf> => {
  const pages: PdfPage[] = [
    { kind: answerKeyOnly ? "answerKey" : "worksheet", lines: [], answerRules: [] },
  ];
  const doc = await createPdfDocument(problems, settings, paperSizes, labels, {
    pages,
    answerKey,
    answerKeyOnly,
    signal,
  });
  return {
    width: doc.internal.pageSize.getWidth(),
    height: doc.internal.pageSize.getHeight(),
    pages,
    save: (filename) => doc.save(filename),
  };
};

export const prepareAnswerKeyPdf = async (
  problems: Problem[],
  settings: Settings,
  paperSizes: PaperSizeOptions,
  labels: PdfLabels,
  signal?: AbortSignal,
): Promise<PreparedPdf> => {
  if (problems.length === 0) throw new Error("Cannot export an answer key without problems");
  return preparePdf(problems, settings, paperSizes, labels, true, signal, true);
};

export const generatePdf = async (
  problems: Problem[],
  settings: Settings,
  paperSizes: PaperSizeOptions,
  filename = "problems.pdf",
  labels: PdfLabels = defaultLabels,
): Promise<void> => {
  const doc = await createPdfDocument(problems, settings, paperSizes, labels);
  doc.save(filename);
};
