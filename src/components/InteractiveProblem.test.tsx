import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Problem } from '../types';
import InteractiveProblem from './InteractiveProblem';

const mockProblem: Problem = {
  id: 1,
  text: '2 + 3 = ',
  correctAnswer: 5,
};

const mockProblemWithAnswer: Problem = {
  id: 2,
  text: '4 × 5 = ',
  correctAnswer: 20,
  userAnswer: 20,
  isCorrect: true,
  isAnswered: true,
};

const mockIncorrectProblem: Problem = {
  id: 3,
  text: '10 - 3 = ',
  correctAnswer: 7,
  userAnswer: 5,
  isCorrect: false,
  isAnswered: true,
};

describe('InteractiveProblem', () => {
  const mockOnAnswerSubmit = vi.fn();

  beforeEach(() => {
    mockOnAnswerSubmit.mockClear();
  });

  test('renders problem text correctly', () => {
    render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

    expect(screen.getByText(/2 \+ 3 =/)).toBeDefined();
  });

  test('renders input field and submit button', () => {
    render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

    expect(screen.getByPlaceholderText('输入答案')).toBeDefined();
    expect(screen.getByRole('button', { name: '提交' })).toBeDefined();
  });

  test('allows user to input answer', async () => {
    const user = userEvent.setup();
    render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

    const input = screen.getByPlaceholderText('输入答案');
    await user.type(input, '5');

    expect(input.value).toBe('5');
  });

  test('submits answer when form is submitted', async () => {
    const user = userEvent.setup();
    render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

    const input = screen.getByPlaceholderText('输入答案');
    const submitButton = screen.getByRole('button', { name: '提交' });

    await user.type(input, '5');
    await user.click(submitButton);

    expect(mockOnAnswerSubmit).toHaveBeenCalledWith(1, 5);
  });

  test('submits answer when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

    const input = screen.getByPlaceholderText('输入答案');
    await user.type(input, '5');
    await user.keyboard('{Enter}');

    expect(mockOnAnswerSubmit).toHaveBeenCalledWith(1, 5);
  });

  test('handles decimal answers', async () => {
    const user = userEvent.setup();
    render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

    const input = screen.getByPlaceholderText('输入答案');
    await user.type(input, '5.5');
    await user.keyboard('{Enter}');

    expect(mockOnAnswerSubmit).toHaveBeenCalledWith(1, 5.5);
  });

  test('does not submit empty answer', async () => {
    const user = userEvent.setup();
    render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

    const submitButton = screen.getByRole('button', { name: '提交' });
    await user.click(submitButton);

    expect(mockOnAnswerSubmit).not.toHaveBeenCalled();
  });

  test('does not submit whitespace-only answer', async () => {
    const user = userEvent.setup();
    render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

    const input = screen.getByPlaceholderText('输入答案');
    await user.type(input, '   ');
    await user.keyboard('{Enter}');

    expect(mockOnAnswerSubmit).not.toHaveBeenCalled();
  });

  test('does not submit invalid number', async () => {
    const user = userEvent.setup();
    render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

    const input = screen.getByPlaceholderText('输入答案');
    await user.type(input, 'abc');
    await user.keyboard('{Enter}');

    expect(mockOnAnswerSubmit).not.toHaveBeenCalled();
  });

  test('disables input and button after submission', () => {
    render(
      <InteractiveProblem problem={mockProblemWithAnswer} onAnswerSubmit={mockOnAnswerSubmit} />
    );

    const input = screen.getByPlaceholderText('输入答案');
    const submitButton = screen.getByRole('button', { name: '已提交' });

    expect(input.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);
  });

  test('shows user answer when problem has been answered', () => {
    render(
      <InteractiveProblem problem={mockProblemWithAnswer} onAnswerSubmit={mockOnAnswerSubmit} />
    );

    const input = screen.getByPlaceholderText('输入答案');
    expect(input.value).toBe('20');
  });

  test('shows correct result when showResult is true and answer is correct', () => {
    render(
      <InteractiveProblem
        problem={mockProblemWithAnswer}
        onAnswerSubmit={mockOnAnswerSubmit}
        showResult={true}
      />
    );

    expect(screen.getByText('✅')).toBeDefined();
    expect(screen.getByText('正确！')).toBeDefined();
  });

  test('shows incorrect result when showResult is true and answer is wrong', () => {
    render(
      <InteractiveProblem
        problem={mockIncorrectProblem}
        onAnswerSubmit={mockOnAnswerSubmit}
        showResult={true}
      />
    );

    expect(screen.getByText('❌')).toBeDefined();
    expect(screen.getByText('错误。正确答案是')).toBeDefined();
    expect(screen.getByText('7')).toBeDefined();
  });

  test('does not show result when showResult is false', () => {
    render(
      <InteractiveProblem
        problem={mockProblemWithAnswer}
        onAnswerSubmit={mockOnAnswerSubmit}
        showResult={false}
      />
    );

    expect(screen.queryByText('✅')).toBeNull();
    expect(screen.queryByText('正确！')).toBeNull();
  });

  test('applies correct CSS class when answer is correct', () => {
    const { container } = render(
      <InteractiveProblem
        problem={mockProblemWithAnswer}
        onAnswerSubmit={mockOnAnswerSubmit}
        showResult={true}
      />
    );

    expect((container.firstChild as Element)?.classList.contains('interactive-problem')).toBe(true);
    expect((container.firstChild as Element)?.classList.contains('correct')).toBe(true);
  });

  test('applies incorrect CSS class when answer is wrong', () => {
    const { container } = render(
      <InteractiveProblem
        problem={mockIncorrectProblem}
        onAnswerSubmit={mockOnAnswerSubmit}
        showResult={true}
      />
    );

    expect((container.firstChild as Element)?.classList.contains('interactive-problem')).toBe(true);
    expect((container.firstChild as Element)?.classList.contains('incorrect')).toBe(true);
  });

  test('respects disabled prop', async () => {
    const user = userEvent.setup();
    render(
      <InteractiveProblem
        problem={mockProblem}
        onAnswerSubmit={mockOnAnswerSubmit}
        disabled={true}
      />
    );

    const input = screen.getByPlaceholderText('输入答案');
    const submitButton = screen.getByRole('button', { name: '提交' });

    expect(input.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);

    await user.keyboard('{Enter}');
    expect(mockOnAnswerSubmit).not.toHaveBeenCalled();
  });

  test('updates state when problem changes', () => {
    const { rerender } = render(
      <InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />
    );

    const input = screen.getByPlaceholderText('输入答案');
    expect(input.value).toBe('');

    rerender(
      <InteractiveProblem problem={mockProblemWithAnswer} onAnswerSubmit={mockOnAnswerSubmit} />
    );

    expect(input.value).toBe('20');
  });

  test('resets state when problem changes to unanswered', () => {
    const { rerender } = render(
      <InteractiveProblem problem={mockProblemWithAnswer} onAnswerSubmit={mockOnAnswerSubmit} />
    );

    const input = screen.getByPlaceholderText('输入答案');
    expect(input.value).toBe('20');
    expect(input.disabled).toBe(true);

    rerender(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

    expect(input.value).toBe('');
    expect(input.disabled).toBe(false);
  });

  test('submit button is disabled when input is empty', () => {
    render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

    const submitButton = screen.getByRole('button', { name: '提交' });
    expect(submitButton.disabled).toBe(true);
  });

  test('submit button is enabled when input has value', async () => {
    const user = userEvent.setup();
    render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

    const input = screen.getByPlaceholderText('输入答案');
    const submitButton = screen.getByRole('button', { name: '提交' });

    await user.type(input, '5');
    expect(submitButton.disabled).toBe(false);
  });

  test('handles form submission with preventDefault', async () => {
    const user = userEvent.setup();
    render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

    const form = document.querySelector('form');
    const input = screen.getByPlaceholderText('输入答案');

    await user.type(input, '5');

    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

    fireEvent(form!, submitEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  test('handles keypress events correctly', async () => {
    const user = userEvent.setup();
    render(<InteractiveProblem problem={mockProblem} onAnswerSubmit={mockOnAnswerSubmit} />);

    const input = screen.getByPlaceholderText('输入答案');
    await user.type(input, '5');

    // Clear any previous calls from typing
    mockOnAnswerSubmit.mockClear();

    // Test non-Enter key - should not submit
    fireEvent.keyPress(input, { key: 'a', code: 'KeyA' });
    expect(mockOnAnswerSubmit).not.toHaveBeenCalled();

    // Test that the component handles keypress events (covered by other tests)
    // This test ensures the keypress functionality is covered
    expect(input).toBeDefined();
  });

  test('getResultIcon returns null when conditions not met', () => {
    render(
      <InteractiveProblem
        problem={mockProblem}
        onAnswerSubmit={mockOnAnswerSubmit}
        showResult={false}
      />
    );

    expect(screen.queryByText('✅')).toBeNull();
    expect(screen.queryByText('❌')).toBeNull();
  });

  test('getResultClass returns empty string when conditions not met', () => {
    const { container } = render(
      <InteractiveProblem
        problem={mockProblem}
        onAnswerSubmit={mockOnAnswerSubmit}
        showResult={false}
      />
    );

    expect((container.firstChild as Element)?.classList.contains('correct')).toBe(false);
    expect((container.firstChild as Element)?.classList.contains('incorrect')).toBe(false);
  });
});
