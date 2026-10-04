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
}
const defaultLabels: PdfLabels = {
  group: (index, empty) => `Group ${index}${empty ? " (no problems)" : ""}`,
  empty: "No problems are available.",
};
const printable = (text: string): string => text.replaceAll(/[✖×]/g, "x").replaceAll(/[➗÷]/g, "/");
/** Browser fonts cover CJK headings; arithmetic remains selectable PDF text. */
const drawHeading = (doc: jsPDF, text: string, x: number, y: number, size: number): void => {
  if (/^[\x20-\x7E]*$/.test(text)) {
    doc.text(text, x, y);
    return;
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
};
const createPdfWriter = (doc: jsPDF, settings: Settings, labels: PdfLabels) => {
  const margin = 28;
  const width = doc.internal.pageSize.getWidth();
  const bottom = doc.internal.pageSize.getHeight() - margin;
  const columnWidth = (width - 3 * margin) / 2;
  const spacing = Math.max(settings.lineSpacing, settings.fontSize * 1.25);
  let positions = [margin + settings.fontSize, margin + settings.fontSize];
  const newPage = () => {
    doc.addPage();
    positions = [margin + settings.fontSize, margin + settings.fontSize];
  };
  const heading = (index: number, empty: boolean) => {
    doc.setFontSize(settings.fontSize + 2);
    drawHeading(doc, labels.group(index, empty), margin, positions[0], settings.fontSize + 2);
    positions = positions.map((position) => position + spacing * 2);
    doc.setFontSize(settings.fontSize);
  };
  const problem = (item: Problem, index: number) => {
    const column = index % 2;
    const lines = doc.splitTextToSize(printable(item.text), columnWidth) as string[];
    for (const line of lines) {
      if (positions[column] + spacing > bottom) newPage();
      doc.text(line, margin + column * (columnWidth + margin), positions[column]);
      positions[column] += spacing;
    }
  };
  const empty = () => drawHeading(doc, labels.empty, margin, positions[0], settings.fontSize);
  return { newPage, heading, problem, empty };
};

const renderProblemBatches = (
  problems: Problem[],
  render: (problem: Problem, index: number) => void,
  start = 0,
): Promise<void> => {
  const end = Math.min(start + 200, problems.length);
  for (let index = start; index < end; index++) render(problems[index], index);
  if (end === problems.length) return Promise.resolve();
  // Continue after yielding; promise chaining preserves ordering and propagates drawing errors.
  return new Promise<void>((resolve) => setTimeout(resolve, 0)).then(() =>
    renderProblemBatches(problems, render, end),
  );
};
const renderGroups = (
  groups: Problem[][],
  writer: ReturnType<typeof createPdfWriter>,
  enableGrouping: boolean,
  index = 0,
): Promise<void> => {
  if (index === groups.length) return Promise.resolve();
  if (index > 0) writer.newPage();
  if (enableGrouping) writer.heading(index + 1, !groups[index].length);
  return renderProblemBatches(groups[index], writer.problem).then(() =>
    renderGroups(groups, writer, enableGrouping, index + 1),
  );
};
export const generatePdf = async (
  problems: Problem[],
  settings: Settings,
  paperSizes: PaperSizeOptions,
  filename = "problems.pdf",
  labels: PdfLabels = defaultLabels,
): Promise<void> => {
  if (
    !Number.isFinite(settings.fontSize) ||
    settings.fontSize < 6 ||
    settings.fontSize > 72 ||
    !Number.isFinite(settings.lineSpacing) ||
    settings.lineSpacing <= 0 ||
    settings.lineSpacing > 144 ||
    !paperSizes[settings.paperSize]
  )
    throw new Error("Invalid PDF settings");
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ format: paperSizes[settings.paperSize], unit: "pt" });
  doc.setFontSize(settings.fontSize);
  const writer = createPdfWriter(doc, settings, labels);
  if (problems.length) {
    await renderGroups(
      splitProblemsIntoGroups(problems, settings),
      writer,
      settings.enableGrouping,
    );
  } else {
    writer.empty();
  }
  doc.save(filename);
};
