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
  if (!problems.length) {
    drawHeading(doc, labels.empty, margin, positions[0], settings.fontSize);
  } else {
    const groups = splitProblemsIntoGroups(problems, settings);
    for (const [groupIndex, group] of groups.entries()) {
      if (groupIndex) newPage();
      if (settings.enableGrouping) {
        doc.setFontSize(settings.fontSize + 2);
        drawHeading(
          doc,
          labels.group(groupIndex + 1, !group.length),
          margin,
          positions[0],
          settings.fontSize + 2,
        );
        positions = positions.map((position) => position + spacing * 2);
        doc.setFontSize(settings.fontSize);
      }
      for (const [index, problem] of group.entries()) {
        // Yield between batches so large exports keep buttons and status responsive.
        if (index > 0 && index % 200 === 0)
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
        const column = index % 2;
        const lines = doc.splitTextToSize(printable(problem.text), columnWidth) as string[];
        for (const line of lines) {
          if (positions[column] + spacing > bottom) newPage();
          doc.text(line, margin + column * (columnWidth + margin), positions[column]);
          positions[column] += spacing;
        }
      }
    }
  }
  doc.save(filename);
};
