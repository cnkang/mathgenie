import type { Problem, Settings, PaperSizeOptions } from '@/types';

let jsPDFModule: typeof import('jspdf').default | null = null;

const loadJsPDF = async (): Promise<typeof import('jspdf').default> => {
  if (!jsPDFModule) {
    const { default: jsPDF } = await import('jspdf');
    jsPDFModule = jsPDF;
  }
  return jsPDFModule;
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

  problems.forEach((problem, index) => {
    const columnKey = getColumnKey(index);
    if (shouldAddNewPage(columnState[columnKey], lineSpacing, pageHeight)) {
      doc.addPage();
      resetColumns(columnState, marginTop);
    }

    const yPosition = columnState[columnKey];
    doc.text(problem.text, getTextXPosition(columnKey, marginLeft, colWidth), yPosition);
    columnState[columnKey] = yPosition + lineSpacing;
  });

  doc.save(filename);
};

export { loadJsPDF };
