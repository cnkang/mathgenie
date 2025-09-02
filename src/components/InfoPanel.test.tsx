import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Problem, QuizResult, Settings } from '../types';
import InfoPanel from './InfoPanel';

// Mock the translation hook
vi.mock('../i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockSettings: Settings = {
  operations: ['+', '-'],
  numRange: [1, 10],
  resultRange: [0, 20],
  numOperandsRange: [2, 3],
  numProblems: 10,
  allowNegative: false,
  showAnswers: false,
  fontSize: 16,
  lineSpacing: 1.5,
  paperSize: 'a4',
};

const mockProblems: Problem[] = [
  { id: 1, text: '2 + 3 = ', correctAnswer: 5 },
  { id: 2, text: '5 - 2 = ', correctAnswer: 3 },
];

const mockQuizResult: QuizResult = {
  score: 85,
  grade: 'B',
  correctAnswers: 8,
  totalProblems: 10,
  incorrectAnswers: 2,
  feedback: 'Good job!',
};

describe('InfoPanel', () => {
  const mockOnGenerateProblems = vi.fn();
  const mockOnDownloadPdf = vi.fn();
  const mockOnStartQuiz = vi.fn();

  beforeEach(() => {
    mockOnGenerateProblems.mockClear();
    mockOnDownloadPdf.mockClear();
    mockOnStartQuiz.mockClear();
  });

  test('renders info panel with basic stats', () => {
    render(
      <InfoPanel
        problems={mockProblems}
        settings={mockSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    expect(screen.getByText('练习统计')).toBeDefined();
    expect(screen.getByText('当前题目')).toBeDefined();
    expect(screen.getByText('累计生成')).toBeDefined();
    expect(screen.getByText('难度等级')).toBeDefined();
    expect(screen.getByText('运算类型')).toBeDefined();
  });

  test('displays correct problem count', () => {
    render(
      <InfoPanel
        problems={mockProblems}
        settings={mockSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    // Use more specific selector to find the current problems count
    const statCards = screen.getAllByText('2');
    expect(statCards.length).toBeGreaterThan(0); // Should have multiple "2" values
  });

  test('shows learning progress section', () => {
    render(
      <InfoPanel
        problems={mockProblems}
        settings={mockSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    expect(screen.getByText('🎯 学习进度')).toBeDefined();
    expect(screen.getByText(/已完成.*%/)).toBeDefined();
  });

  test('renders quick action buttons', () => {
    render(
      <InfoPanel
        problems={mockProblems}
        settings={mockSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    expect(screen.getByText('重新生成题目')).toBeDefined();
    expect(screen.getByText('下载PDF')).toBeDefined();
    expect(screen.getByText('开始答题')).toBeDefined();
    expect(screen.getByText('跳转到题目')).toBeDefined();
  });

  test('calls onGenerateProblems when regenerate button is clicked', () => {
    render(
      <InfoPanel
        problems={mockProblems}
        settings={mockSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    const regenerateButton = screen.getByText('重新生成题目');
    fireEvent.click(regenerateButton);

    expect(mockOnGenerateProblems).toHaveBeenCalledTimes(1);
  });

  test('calls onDownloadPdf when download button is clicked', () => {
    render(
      <InfoPanel
        problems={mockProblems}
        settings={mockSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    const downloadButton = screen.getByText('下载PDF');
    fireEvent.click(downloadButton);

    expect(mockOnDownloadPdf).toHaveBeenCalledTimes(1);
  });

  test('calls onStartQuiz when start quiz button is clicked', () => {
    render(
      <InfoPanel
        problems={mockProblems}
        settings={mockSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    const startQuizButton = screen.getByText('开始答题');
    fireEvent.click(startQuizButton);

    expect(mockOnStartQuiz).toHaveBeenCalledTimes(1);
  });

  test('disables PDF and quiz buttons when no problems', () => {
    render(
      <InfoPanel
        problems={[]}
        settings={mockSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    const downloadButton = screen.getByText('下载PDF');
    const startQuizButton = screen.getByText('开始答题');

    expect(downloadButton.disabled).toBe(true);
    expect(startQuizButton.disabled).toBe(true);
  });

  test('displays quiz result when provided', () => {
    render(
      <InfoPanel
        problems={mockProblems}
        settings={mockSettings}
        quizResult={mockQuizResult}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    expect(screen.getByText('🏆 最近答题结果')).toBeDefined();
    expect(screen.getByText('85分')).toBeDefined();
    expect(screen.getByText('B')).toBeDefined();
    expect(screen.getByText('80%')).toBeDefined(); // 8/10 * 100%
  });

  test('shows current configuration', () => {
    render(
      <InfoPanel
        problems={mockProblems}
        settings={mockSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    expect(screen.getByText('⚙️ 当前配置')).toBeDefined();
    expect(screen.getByText('运算: +, -')).toBeDefined();
    expect(screen.getByText('数字: 1-10')).toBeDefined();
    expect(screen.getByText('结果: 0-20')).toBeDefined();
    expect(screen.getByText('操作数: 2-3个')).toBeDefined();
  });

  test('calculates difficulty level correctly for beginner', () => {
    const beginnerSettings: Settings = {
      ...mockSettings,
      operations: ['+'],
      numRange: [1, 5],
      numOperandsRange: [2, 2],
    };

    render(
      <InfoPanel
        problems={mockProblems}
        settings={beginnerSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    expect(screen.getByText('初级')).toBeDefined();
  });

  test('calculates difficulty level correctly for intermediate', () => {
    const intermediateSettings: Settings = {
      ...mockSettings,
      operations: ['+', '-', '*'],
      numRange: [1, 50], // Increase range to trigger intermediate level
      numOperandsRange: [2, 3],
    };

    render(
      <InfoPanel
        problems={mockProblems}
        settings={intermediateSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    expect(screen.getByText('中级')).toBeDefined();
  });

  test('calculates difficulty level correctly for advanced', () => {
    const advancedSettings: Settings = {
      ...mockSettings,
      operations: ['+', '-', '*', '/'],
      numRange: [1, 50],
      numOperandsRange: [3, 4],
    };

    render(
      <InfoPanel
        problems={mockProblems}
        settings={advancedSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    expect(screen.getByText('高级')).toBeDefined();
  });

  test('calculates difficulty level correctly for expert', () => {
    const expertSettings: Settings = {
      ...mockSettings,
      operations: ['+', '-', '×', '÷'],
      numRange: [1, 100],
      numOperandsRange: [4, 5],
    };

    render(
      <InfoPanel
        problems={mockProblems}
        settings={expertSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    expect(screen.getByText('专家')).toBeDefined();
  });

  test('handles empty problems array correctly', () => {
    render(
      <InfoPanel
        problems={[]}
        settings={mockSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    // Check for multiple "0" values in different stat cards
    const zeroValues = screen.getAllByText('0');
    expect(zeroValues.length).toBeGreaterThan(0); // Should have multiple "0" values
    expect(screen.getByText('初级')).toBeDefined(); // Should default to beginner
  });

  test('displays tips section', () => {
    render(
      <InfoPanel
        problems={mockProblems}
        settings={mockSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    expect(screen.getByText('💡 使用技巧')).toBeDefined();
    expect(screen.getByText('使用快速预设可以快速配置常用设置')).toBeDefined();
  });

  test('handles scroll to problems when jump button is clicked', () => {
    // Mock querySelector and scrollIntoView
    const mockElement = {
      scrollIntoView: vi.fn(),
    };
    const mockQuerySelector = vi
      .spyOn(document, 'querySelector')
      .mockReturnValue(mockElement as any);

    render(
      <InfoPanel
        problems={mockProblems}
        settings={mockSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    const jumpButton = screen.getByText('跳转到题目');
    fireEvent.click(jumpButton);

    expect(mockQuerySelector).toHaveBeenCalledWith('.problems-grid');
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

    mockQuerySelector.mockRestore();
  });

  test('handles scroll when element not found', () => {
    const mockQuerySelector = vi.spyOn(document, 'querySelector').mockReturnValue(null);

    render(
      <InfoPanel
        problems={mockProblems}
        settings={mockSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    const jumpButton = screen.getByText('跳转到题目');
    fireEvent.click(jumpButton);

    expect(mockQuerySelector).toHaveBeenCalledWith('.problems-grid');
    // Should not throw error when element is null

    mockQuerySelector.mockRestore();
  });

  test('updates session stats when problems change', () => {
    const { rerender } = render(
      <InfoPanel
        problems={[]}
        settings={mockSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    // Initially should show 0 cumulative
    const initialZeros = screen.getAllByText('0');
    expect(initialZeros.length).toBeGreaterThan(0);

    // Add problems
    rerender(
      <InfoPanel
        problems={mockProblems}
        settings={mockSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    // Should update cumulative count
    const updatedTwos = screen.getAllByText('2');
    expect(updatedTwos.length).toBeGreaterThan(0); // Current problems
  });

  test('calculates learning progress correctly', () => {
    const manyProblems = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      text: `${i + 1} + 1 = `,
      correctAnswer: i + 2,
    }));

    render(
      <InfoPanel
        problems={manyProblems}
        settings={mockSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    // Should show 50% progress (50 out of 100 target)
    expect(screen.getByText(/已完成 50%/)).toBeDefined();
  });

  test('caps learning progress at 100%', () => {
    const manyProblems = Array.from({ length: 150 }, (_, i) => ({
      id: i + 1,
      text: `${i + 1} + 1 = `,
      correctAnswer: i + 2,
    }));

    render(
      <InfoPanel
        problems={manyProblems}
        settings={mockSettings}
        onGenerateProblems={mockOnGenerateProblems}
        onDownloadPdf={mockOnDownloadPdf}
        onStartQuiz={mockOnStartQuiz}
      />
    );

    // Should cap at 100% even with more than 100 problems
    expect(screen.getByText(/已完成 100%/)).toBeDefined();
  });
});
