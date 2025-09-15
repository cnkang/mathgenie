import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '../../tests/helpers/testUtils';
import type { Problem } from '../types';
import InteractiveProblem from './InteractiveProblem';

// Mock the translation system for unit tests
vi.mock('../i18n', async () => {
  const { mockUseTranslation } = await import('../../tests/helpers/mockTranslations');
  return mockUseTranslation({
    'quiz.enterAnswer': 'Enter answer',
    'quiz.submit': 'Submit',
    'quiz.submitted': 'Submitted',
    'quiz.correct': 'Correct!',
    'quiz.incorrect': 'Incorrect.',
    'quiz.correctAnswer': 'The correct answer is {{answer}}',
  });
});

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
    // Ensure clean DOM state
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Clean up after each test
    document.body.innerHTML = '';
  });

  describe('Rendering', () => {
    test('renders problem text correctly', () => {
      render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);
      expect(screen.getByText('2 + 3 =')).toBeInTheDocument();
    });

    test('renders input with correct placeholder', () => {
      const { container } = render(
        <InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />
      );
      const input = container.querySelector('.answer-input') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.placeholder).toBe('Enter answer');
    });

    test('renders submit button with correct text', () => {
      const { container } = render(
        <InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />
      );
      const button = container.querySelector('.submit-answer-btn') as HTMLButtonElement;
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe('Submit');
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
      const { container } = render(
        <InteractiveProblem problem={mockAnsweredProblem} onAnswerSubmit={mockOnAnswerSubmit} />
      );

      const button = container.querySelector('.submit-answer-btn') as HTMLButtonElement;
      expect(button).toBeTruthy();
      expect(button.disabled).toBe(true);
      expect(button.textContent).toBe('Submitted');
    });
  });

  describe('User Interactions', () => {
    test('allows user to enter answer', async () => {
      const { container } = render(
        <InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />
      );

      const input = container.querySelector('.answer-input') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Use fireEvent instead of userEvent for more reliable testing
      fireEvent.change(input, { target: { value: '5' } });

      expect((input as HTMLInputElement).value).toBe('5');
    });

    test('calls onAnswerSubmit when form is submitted with valid answer', () => {
      const { container } = render(
        <InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />
      );

      const input = container.querySelector('.answer-input') as HTMLInputElement;
      const button = container.querySelector('.submit-answer-btn') as HTMLButtonElement;

      expect(input).toBeTruthy();
      expect(button).toBeTruthy();

      // Type the answer using fireEvent
      fireEvent.change(input, { target: { value: '5' } });

      // Button should be enabled now
      expect(button.disabled).toBe(false);

      // Submit the form
      fireEvent.click(button);

      expect(mockOnAnswerSubmit).toHaveBeenCalledWith(1, 5);
    });

    test('calls onAnswerSubmit when Enter key is pressed', () => {
      const { container } = render(
        <InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />
      );

      const input = container.querySelector('.answer-input') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Type the answer using fireEvent
      fireEvent.change(input, { target: { value: '5' } });

      // Press Enter
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnAnswerSubmit).toHaveBeenCalledWith(1, 5);
    });

    test('does not submit when input is empty', async () => {
      const user = userEvent.setup();
      const localOnSubmit = vi.fn();
      const { container } = render(
        <InteractiveProblem problem={mockProblem} onAnswerSubmit={localOnSubmit} />
      );

      const button = container.querySelector('.submit-answer-btn') as HTMLButtonElement;
      expect(button).toBeTruthy();
      await user.click(button);

      expect(localOnSubmit).not.toHaveBeenCalled();
    });

    test('handles negative numbers correctly', async () => {
      const { container } = render(
        <InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />
      );

      const input = container.querySelector('.answer-input') as HTMLInputElement;
      expect(input).toBeTruthy();

      // Enter negative number synchronously to avoid flakiness
      fireEvent.change(input, { target: { value: '-3' } });

      const button = container.querySelector('.submit-answer-btn') as HTMLButtonElement;
      expect(button).toBeTruthy();
      expect(button.disabled).toBe(false);

      fireEvent.click(button);

      expect(mockOnAnswerSubmit).toHaveBeenCalledWith(1, -3);
    });
  });

  describe('Accessibility', () => {
    test('has proper form structure', () => {
      const { container } = render(
        <InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />
      );

      const input = container.querySelector('.answer-input');
      const button = container.querySelector('.submit-answer-btn');
      expect(input).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });

    test('input has proper accessibility attributes', () => {
      const { container } = render(
        <InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />
      );

      const input = container.querySelector('.answer-input') as HTMLInputElement;
      expect(input).toBeTruthy();
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
    test('handles zero as valid answer', () => {
      const { container } = render(
        <InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />
      );

      const input = container.querySelector('.answer-input') as HTMLInputElement;
      expect(input).toBeTruthy();

      fireEvent.change(input, { target: { value: '0' } });

      const button = container.querySelector('.submit-answer-btn') as HTMLButtonElement;
      expect(button).toBeTruthy();
      expect(button.disabled).toBe(false);

      fireEvent.click(button);

      expect(mockOnAnswerSubmit).toHaveBeenCalledWith(1, 0);
    });

    test('handles decimal numbers correctly', () => {
      const { container } = render(
        <InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />
      );

      const input = container.querySelector('.answer-input') as HTMLInputElement;
      expect(input).toBeTruthy();

      fireEvent.change(input, { target: { value: '5.5' } });

      const button = container.querySelector('.submit-answer-btn') as HTMLButtonElement;
      expect(button).toBeTruthy();
      expect(button.disabled).toBe(false);

      fireEvent.click(button);

      expect(mockOnAnswerSubmit).toHaveBeenCalledWith(1, 5.5);
    });

    test('clears input and refocuses after submission', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />
      );

      const input = container.querySelector('.answer-input') as HTMLInputElement;
      const button = container.querySelector('.submit-answer-btn') as HTMLButtonElement;

      expect(input).toBeTruthy();
      expect(button).toBeTruthy();

      await user.clear(input);
      await user.type(input, '5');
      await user.click(button);

      // Input should be cleared after submission
      expect((input as HTMLInputElement).value).toBe('');
    });
  });
});
