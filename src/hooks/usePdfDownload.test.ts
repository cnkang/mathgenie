import { describe, expect, test, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PaperSizeOptions, Problem, Settings } from '@/types';
import { usePdfDownload } from './useAppLogic';

// Isolated mock for pdf util
vi.mock('@/utils/pdf', () => ({
  generatePdf: vi.fn().mockResolvedValue(undefined),
}));

const mockSettings: Settings = {
  operations: ['+'],
  numProblems: 10,
  numRange: [1, 10],
  resultRange: [0, 20],
  numOperandsRange: [2, 3],
  allowNegative: false,
  showAnswers: false,
  fontSize: 16,
  lineSpacing: 12,
  paperSize: 'a4',
  enableGrouping: false,
  problemsPerGroup: 20,
  totalGroups: 1,
};

const mockPaperSizeOptions: PaperSizeOptions = {
  a4: 'a4',
  letter: 'letter',
  legal: 'legal',
};

const mockProblems: Problem[] = [
  { id: 1, text: '2 + 3 = ?', correctAnswer: 5 },
  { id: 2, text: '4 + 5 = ?', correctAnswer: 9 },
];

describe('usePdfDownload (isolated)', () => {
  test('should generate PDF successfully', async () => {
    const mockShowSuccessMessage = vi.fn();
    const mockSetError = vi.fn();
    const mockClearMessages = vi.fn();

    const { result } = renderHook(() =>
      usePdfDownload(
        mockProblems,
        mockSettings,
        mockPaperSizeOptions,
        mockShowSuccessMessage,
        mockSetError,
        mockClearMessages,
        false
      )
    );

    expect(typeof result.current).toBe('function');
    await act(async () => {
      await result.current();
    });

    expect(mockClearMessages).toHaveBeenCalled();
    expect(mockShowSuccessMessage).toHaveBeenCalledWith({ key: 'messages.success.pdfGenerated' });
    expect(mockSetError).not.toHaveBeenCalled();
  });

  test('should handle PDF generation error', async () => {
    const pdfModule = await import('@/utils/pdf');
    (pdfModule.generatePdf as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('PDF error')
    );

    const mockShowSuccessMessage = vi.fn();
    const mockSetError = vi.fn();
    const mockClearMessages = vi.fn();

    const { result } = renderHook(() =>
      usePdfDownload(
        mockProblems,
        mockSettings,
        mockPaperSizeOptions,
        mockShowSuccessMessage,
        mockSetError,
        mockClearMessages,
        true
      )
    );

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await act(async () => {
      await result.current();
    });

    expect(mockSetError).toHaveBeenCalledWith({ key: 'errors.pdfFailed' });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('should handle empty problems array', async () => {
    const mockShowSuccessMessage = vi.fn();
    const mockSetError = vi.fn();
    const mockClearMessages = vi.fn();

    const { result } = renderHook(() => ({
      download: usePdfDownload(
        [],
        mockSettings,
        mockPaperSizeOptions,
        mockShowSuccessMessage,
        mockSetError,
        mockClearMessages,
        false
      ),
    }));

    await waitFor(() => expect(result.current).not.toBeNull());
    expect(typeof result.current!.download).toBe('function');
    await act(async () => {
      await result.current!.download();
    });

    expect(mockSetError).toHaveBeenCalledWith({ key: 'errors.noProblemsToPdf' });
    expect(mockShowSuccessMessage).not.toHaveBeenCalled();
    expect(mockClearMessages).not.toHaveBeenCalled();
  });
});
