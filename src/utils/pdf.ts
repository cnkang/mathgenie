import type { PaperSizeOptions, Problem, Settings } from '@/types';
import type { jsPDF } from 'jspdf';

let jsPDFModule: typeof import('jspdf').default | null = null;

const loadJsPDF = async (): Promise<typeof import('jspdf').default> => {
  // In test environment, always reload to ensure mocks work
  if (process.env.NODE_ENV === 'test') {
    const { default: jsPDF } = await import('jspdf');
    return jsPDF;
  }

  if (!jsPDFModule) {
    const { default: jsPDF } = await import('jspdf');
    jsPDFModule = jsPDF;
  }
  return jsPDFModule;
};

// For testing purposes - allows clearing the cache
export const clearJsPDFCache = (): void => {
  jsPDFModule = null;
};

const shouldAddNewPage = (currentY: number, spacing: number, pageHeight: number): boolean => {
  return currentY + spacing > pageHeight;
};

const resetColumns = (state: Record<'left' | 'right', number>, marginTop: number): void => {
  state.left = marginTop;
  state.right = marginTop;
};

const getColumnKey = (index: number): 'left' | 'right' => (index % 2 === 0 ? 'left' : 'right');

const getTextXPosition = (
  column: 'left' | 'right',
  marginLeft: number,
  colWidth: number
): number => {
  return column === 'left' ? marginLeft : marginLeft + colWidth + marginLeft;
};

interface RenderConfig {
  marginLeft: number;
  marginTop: number;
  lineSpacing: number;
  colWidth: number;
  pageHeight: number;
}

/**
 * Renders a single problem to the PDF
 */
const renderProblem = (
  doc: jsPDF,
  problem: Problem,
  columnKey: 'left' | 'right',
  columnState: Record<'left' | 'right', number>,
  config: RenderConfig
): void => {
  if (shouldAddNewPage(columnState[columnKey], config.lineSpacing, config.pageHeight)) {
    doc.addPage();
    resetColumns(columnState, config.marginTop);
  }

  const yPosition = columnState[columnKey];
  doc.text(
    problem.text,
    getTextXPosition(columnKey, config.marginLeft, config.colWidth),
    yPosition
  );
  columnState[columnKey] = yPosition + config.lineSpacing;
};

/**
 * Generates grouped problems with page breaks between groups
 */
const generateGroupedProblems = (
  doc: jsPDF,
  problems: Problem[],
  settings: Settings,
  columnState: Record<'left' | 'right', number>,
  config: RenderConfig
): void => {
  const totalGroups = settings.totalGroups || 1;
  const problemsPerGroup = settings.problemsPerGroup || problems.length;

  for (let groupIndex = 0; groupIndex < totalGroups; groupIndex++) {
    if (groupIndex > 0) {
      doc.addPage();
      resetColumns(columnState, config.marginTop);
    }

    // Add group title
    doc.setFontSize(settings.fontSize + 2);
    doc.text(`Group ${groupIndex + 1}`, config.marginLeft, columnState.left);
    columnState.left += config.lineSpacing + 5;
    columnState.right = columnState.left;
    doc.setFontSize(settings.fontSize);

    // Generate problems for current group
    const startIndex = groupIndex * problemsPerGroup;
    const endIndex = Math.min(startIndex + problemsPerGroup, problems.length);

    for (let i = startIndex; i < endIndex; i++) {
      const problem = problems[i];
      const localIndex = i - startIndex;
      const columnKey = getColumnKey(localIndex);
      renderProblem(doc, problem, columnKey, columnState, config);
    }
  }
};

/**
 * Generates continuous problems without grouping
 */
const generateContinuousProblems = (
  doc: jsPDF,
  problems: Problem[],
  columnState: Record<'left' | 'right', number>,
  config: RenderConfig
): void => {
  problems.forEach((problem, index) => {
    const columnKey = getColumnKey(index);
    renderProblem(doc, problem, columnKey, columnState, config);
  });
};

/**
 * Generates a PDF document with math problems
 */
export const generatePdf = async (
  problems: Problem[],
  settings: Settings,
  paperSizes: PaperSizeOptions,
  filename = 'problems.pdf'
): Promise<void> => {
  const jsPDF = await loadJsPDF();
  const doc = new jsPDF({ format: paperSizes[settings.paperSize] });

  doc.setFontSize(settings.fontSize);
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  const marginLeft = 10;
  const marginTop = 10;
  const lineSpacing = settings.lineSpacing;
  const colWidth = (pageWidth - 3 * marginLeft) / 2;

  const columnState: Record<'left' | 'right', number> = { left: marginTop, right: marginTop };

  const renderConfig: RenderConfig = {
    marginLeft,
    marginTop,
    lineSpacing,
    colWidth,
    pageHeight,
  };

  if (settings.enableGrouping) {
    generateGroupedProblems(doc, problems, settings, columnState, renderConfig);
  } else {
    generateContinuousProblems(doc, problems, columnState, renderConfig);
  }

  doc.save(filename);
};

export { loadJsPDF };
