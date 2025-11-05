import type { PaperSizeOptions, Problem, Settings } from '@/types';
import { describe, expect, test, vi } from 'vitest';

// Simple mock for jsPDF
const mockJsPDFInstance = {
  setFontSize: vi.fn(),
  internal: { pageSize: { getHeight: () => 1000, getWidth: () => 800 } },
  addPage: vi.fn(),
  text: vi.fn(),
  save: vi.fn(),
};

// Mock the jsPDF module
vi.mock('jspdf', () => {
  // Create a proper constructor function that can be called with 'new'
  function MockJsPDF(_options?: any) {
    return mockJsPDFInstance;
  }

  return {
    default: MockJsPDF,
  };
});

const paperSizes: PaperSizeOptions = {
  a4: 'a4',
  letter: 'letter',
  legal: 'legal',
};

const baseSettings: Settings = {
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
  enableGrouping: false,
  problemsPerGroup: 20,
  totalGroups: 1,
};

describe('pdf utils', () => {
  test('loadJsPDF returns a function', async () => {
    const { loadJsPDF } = await import('./pdf');
    const jsPDF = await loadJsPDF();
    expect(typeof jsPDF).toBe('function');
  });

  test('generatePdf executes without errors', async () => {
    const { generatePdf } = await import('./pdf');
    const problems: Problem[] = [{ id: 1, text: '1 + 1 =' }];

    // Test that the function executes without throwing
    await expect(
      generatePdf(problems, baseSettings, paperSizes, 'test.pdf')
    ).resolves.toBeUndefined();
  });

  test('generatePdf handles empty problems array', async () => {
    const { generatePdf } = await import('./pdf');
    const problems: Problem[] = [];

    // Test that the function handles empty array without throwing
    await expect(
      generatePdf(problems, baseSettings, paperSizes, 'test.pdf')
    ).resolves.toBeUndefined();
  });

  test('generatePdf handles different paper sizes', async () => {
    const { generatePdf } = await import('./pdf');
    const problems: Problem[] = [{ id: 1, text: '1 + 1 =' }];

    const letterSettings = { ...baseSettings, paperSize: 'letter' as const };
    await expect(
      generatePdf(problems, letterSettings, paperSizes, 'test.pdf')
    ).resolves.toBeUndefined();

    const legalSettings = { ...baseSettings, paperSize: 'legal' as const };
    await expect(
      generatePdf(problems, legalSettings, paperSizes, 'test.pdf')
    ).resolves.toBeUndefined();
  });

  test('generatePdf handles grouping settings', async () => {
    const { generatePdf } = await import('./pdf');
    const problems: Problem[] = [
      { id: 1, text: '1 + 1 =' },
      { id: 2, text: '2 + 2 =' },
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
