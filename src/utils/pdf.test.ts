import { describe, expect, test, vi } from 'vitest';
import type { Problem, Settings, PaperSizeOptions } from '@/types';
import { generatePdf, loadJsPDF } from './pdf';

vi.mock('jspdf', () => {
  const ctor = vi.fn(() => ({
    setFontSize: vi.fn(),
    internal: { pageSize: { getHeight: () => 1000, getWidth: () => 1000 } },
    addPage: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
  }));
  return { default: ctor };
});

const paperSizes: PaperSizeOptions = {
  a4: 'a4',
  letter: 'letter',
  legal: 'legal',
};

const settings: Settings = {
  operations: ['+'],
  numProblems: 1,
  numRange: [1, 10],
  resultRange: [1, 10],
  numOperandsRange: [2, 2],
  allowNegative: false,
  showAnswers: false,
  fontSize: 12,
  lineSpacing: 1.5,
  paperSize: 'a4',
};

describe('pdf utils', () => {
  test('loadJsPDF caches module', async () => {
    const first = await loadJsPDF();
    const second = await loadJsPDF();
    expect(first).toBe(second);
  });

  test('generatePdf uses jsPDF', async () => {
    const jsPDF = (await loadJsPDF()) as any;
    const manyProblems: Problem[] = [
      { id: 1, text: '1 + 1 =' },
      { id: 2, text: '2 + 2 =' },
      { id: 3, text: '3 + 3 =' },
    ];
    const customSettings = { ...settings, lineSpacing: 1000 };
    await generatePdf(manyProblems, customSettings, paperSizes, 'custom.pdf');
    expect(jsPDF).toHaveBeenCalledTimes(1);
    const instance = jsPDF.mock.results[0]?.value as any;
    expect(instance.save).toHaveBeenCalledWith('custom.pdf');
  });
});
