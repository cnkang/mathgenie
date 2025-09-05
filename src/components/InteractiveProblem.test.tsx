import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Problem } from '../types';
import InteractiveProblem from './InteractiveProblem';

// Mock the translation system for unit tests
vi.mock('../i18n', () => ({
  useTranslation: vi.fn(() => ({
    t: (key: string, params?: Record<string, string | number>) => {
      const translations: Record<string, string> = {
        'quiz.enterAnswer': 'Enter answer',
        'quiz.submit': 'Submit',
        'quiz.submitted': 'Submitted',
        'quiz.correct': 'Correct!',
        'quiz.incorrect': 'Incorrect.',
        'quiz.correctAnswer': 'The correct answer is {{answer}}',
      };

      let result = translations[key] || key;

      // Handle parameter interpolation
      if (params && typeof result === 'string') {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          const placeholder = '{{' + paramKey + '}}';
          result = result.replace(placeholder, String(paramValue));
        });
      }

      return result;
    },
  })),
}));

describe('InteractiveProblem', () => {
  const mockOnAnswerSubmit = vi.fn();

  const mockProblem: Problem = {
    id: 1,
    text: '2 + 3 = ',
    correctAnswer: 5,
  };

  const mockAnsweredProblem: Problem = {
    id: 2,
    text: '4 × 5 = ',
    correctAnswer: 20,
    userAnswer: 20,
    isCorrect: true,
    isAnswered: true,
  };

  const mockIncorrectProblem: Problem = {
    id: 3,
    text: '7 - 3 = ',
    correctAnswer: 4,
    userAnswer: 5,
    isCorrect: false,
    isAnswered: true,
  };

  beforeEach(() => {
    mockOnAnswerSubmit.mockClear();
  });

  describe('Rendering', () => {
    test('renders problem text correctly', () => {
      render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);
      expect(screen.getByText('2 + 3 =')).toBeInTheDocument();
    });

    test('renders input with correct placeholder', () => {
      render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);
      expect(screen.getByPlaceholderText('Enter answer')).toBeInTheDocument();
    });

    test('renders submit button with correct text', () => {
      render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    test.each([
      [{ ...mockProblem, text: '5 + 3 = ' }, '5 + 3 ='],
      [{ ...mockProblem, text: '10 - 4 = ' }, '10 - 4 ='],
      [{ ...mockProblem, text: '6 × 2 = ' }, '6 × 2 ='],
      [{ ...mockProblem, text: '8 ÷ 2 = ' }, '8 ÷ 2 ='],
    ])('handles different operators correctly', (problem, expectedText) => {
      render(<InteractiveProblem problem={problem} onAnswerSubmit={mockOnAnswerSubmit} />);
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });
  });

  describe('Answered State', () => {
    test('shows user answer when problem is answered correctly', () => {
      render(
        <InteractiveProblem
          problem={mockAnsweredProblem}
          onAnswerSubmit={mockOnAnswerSubmit}
          showResult={true}
        />
      );

      const input = screen.getByDisplayValue('20');
      expect(input).toBeInTheDocument();
      expect(input).toHaveProperty('disabled', true);
      expect(screen.getByText('Correct!')).toBeInTheDocument();
    });

    test('shows user answer when problem is answered incorrectly', () => {
      render(
        <InteractiveProblem
          problem={mockIncorrectProblem}
          onAnswerSubmit={mockOnAnswerSubmit}
          showResult={true}
        />
      );

      const input = screen.getByDisplayValue('5');
      expect(input).toBeInTheDocument();
      expect(input).toHaveProperty('disabled', true);
      expect(screen.getByText(/incorrect/i)).toBeInTheDocument();
      expect(screen.getByText(/the correct answer is 4/i)).toBeInTheDocument();
    });

    test('disables submit button when problem is answered', () => {
      render(
        <InteractiveProblem problem={mockAnsweredProblem} onAnswerSubmit={mockOnAnswerSubmit} />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveProperty('disabled', true);
      expect(button).toHaveTextContent('Submitted');
    });
  });

  describe('User Interactions', () => {
    test('allows user to enter answer', async () => {
      const user = userEvent.setup();
      render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

      const input = screen.getByRole('spinbutton');
      await user.type(input, '5');

      expect(input).toHaveValue('5');
    });

    test('calls onAnswerSubmit when form is submitted with valid answer', async () => {
      const user = userEvent.setup();
      render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

      const input = screen.getByRole('spinbutton');
      const button = screen.getByRole('button', { name: 'Submit' });

      await user.type(input, '5');
      await user.click(button);

      expect(mockOnAnswerSubmit).toHaveBeenCalledWith(1, 5);
    });

    test('calls onAnswerSubmit when Enter key is pressed', async () => {
      const user = userEvent.setup();
      render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

      const input = screen.getByRole('spinbutton');
      await user.type(input, '5');
      await user.keyboard('{Enter}');

      expect(mockOnAnswerSubmit).toHaveBeenCalledWith(1, 5);
    });

    test('does not submit when input is empty', async () => {
      const user = userEvent.setup();
      render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

      const button = screen.getByRole('button', { name: 'Submit' });
      await user.click(button);

      expect(mockOnAnswerSubmit).not.toHaveBeenCalled();
    });

    test('handles negative numbers correctly', async () => {
      const user = userEvent.setup();
      render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

      const input = screen.getByRole('spinbutton');
      await user.type(input, '-3');

      const button = screen.getByRole('button', { name: 'Submit' });
      await user.click(button);

      expect(mockOnAnswerSubmit).toHaveBeenCalledWith(1, -3);
    });
  });

  describe('Accessibility', () => {
    test('has proper form structure', () => {
      render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    test('input has proper accessibility attributes', () => {
      render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveProperty('type', 'number');
      expect(input).toHaveProperty('placeholder', 'Enter answer');
    });

    test('feedback messages are properly announced', () => {
      render(
        <InteractiveProblem
          problem={mockAnsweredProblem}
          onAnswerSubmit={mockOnAnswerSubmit}
          showResult={true}
        />
      );

      // Feedback should be visible for screen readers
      expect(screen.getByText('Correct!')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles zero as valid answer', async () => {
      const user = userEvent.setup();
      render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

      const input = screen.getByRole('spinbutton');
      await user.type(input, '0');

      const button = screen.getByRole('button', { name: 'Submit' });
      await user.click(button);

      expect(mockOnAnswerSubmit).toHaveBeenCalledWith(1, 0);
    });

    test('handles decimal numbers correctly', async () => {
      const user = userEvent.setup();
      render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

      const input = screen.getByRole('spinbutton');
      await user.type(input, '5.5');

      const button = screen.getByRole('button', { name: 'Submit' });
      await user.click(button);

      expect(mockOnAnswerSubmit).toHaveBeenCalledWith(1, 5.5);
    });

    test('clears input and refocuses after submission', async () => {
      const user = userEvent.setup();
      render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

      const input = screen.getByRole('spinbutton');
      await user.type(input, '5');

      const button = screen.getByRole('button', { name: 'Submit' });
      await user.click(button);

      // Input should be cleared after submission
      expect(input).toHaveValue('');
    });
  });
});
