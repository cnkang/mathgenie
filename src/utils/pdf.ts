import type { Problem, Settings, PaperSizeOptions } from '@/types';

let jsPDFModule: typeof import('jspdf').default | null = null;

const loadJsPDF = async (): Promise<typeof import('jspdf').default> => {
  if (!jsPDFModule) {
    const { default: jsPDF } = await import('jspdf');
    jsPDFModule = jsPDF;
  }
  return jsPDFModule;
};

export const generatePdf = async (
  problems: Problem[],
  settings: Settings,
  paperSizes: PaperSizeOptions
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

  let currYLeft = marginTop;
  let currYRight = marginTop;

  problems.forEach((problem, index) => {
    if (index % 2 === 0) {
      if (currYLeft + lineSpacing > pageHeight) {
        doc.addPage();
        currYLeft = marginTop;
        currYRight = marginTop;
      }
      doc.text(problem.text, marginLeft, currYLeft);
      currYLeft += lineSpacing;
    } else {
      if (currYRight + lineSpacing > pageHeight) {
        doc.addPage();
        currYLeft = marginTop;
        currYRight = marginTop;
      }
      doc.text(problem.text, marginLeft + colWidth + marginLeft, currYRight);
      currYRight += lineSpacing;
    }
  });

  doc.save('problems.pdf');
};

export { loadJsPDF };
