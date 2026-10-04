import React from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { useQuizController } from "./useQuizController";
const t = (key: string) => key;
afterEach(() => vi.useRealTimers());
describe("quiz lifecycle regressions", () => {
  it("can finish after leaving and revisiting an answered final problem", () => {
    vi.useFakeTimers();
    const complete = vi.fn();
    const problems = [
      { id: 0, text: "1 + 1 = " },
      { id: 1, text: "2 + 2 = " },
    ];
    const { result } = renderHook(() => useQuizController(problems, t, complete));
    act(() => result.current.goToNext());
    act(() => result.current.handleAnswerSubmit(1, 4));
    act(() => result.current.goToPrevious());
    act(() => vi.advanceTimersByTime(2000));
    expect(complete).not.toHaveBeenCalled();
    act(() => result.current.goToNext());
    act(() => vi.advanceTimersByTime(1600));
    expect(complete).toHaveBeenCalledTimes(1);
    expect(result.current.quizResult?.score).toBe(50);
  });
  it("hides printed answers, honors stored answers and parses negative legacy operands", () => {
    const problems = [
      { id: 1, text: "2 + 3 = 5" },
      { id: 2, text: "-2 + 3 = " },
      { id: 3, text: "2 + 3 ✖ 4 = 14", correctAnswer: 14 },
    ];
    const { result } = renderHook(() => useQuizController(problems, t, vi.fn()));
    expect(result.current.quizProblems.map((problem) => problem.correctAnswer)).toEqual([5, 1, 14]);
    expect(result.current.quizProblems[0].text).toBe("2 + 3 = ");
  });
  it("completes once in StrictMode, freezes time and resets on retry", () => {
    vi.useFakeTimers();
    const complete = vi.fn();
    const problems = [{ id: 0, text: "2 + 3 = " }];
    const { result } = renderHook(() => useQuizController(problems, t, complete), {
      wrapper: ({ children }) => <React.StrictMode>{children}</React.StrictMode>,
    });
    act(() => {
      result.current.handleAnswerSubmit(0, 5);
      result.current.handleAnswerSubmit(0, 5);
    });
    act(() => vi.advanceTimersByTime(1600));
    expect(complete).toHaveBeenCalledTimes(1);
    expect(result.current.quizResult?.score).toBe(100);
    const elapsed = result.current.timeElapsed;
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.timeElapsed).toBe(elapsed);
    act(() => result.current.restartQuiz());
    expect(result.current.timeElapsed).toBe(0);
    expect(result.current.showResults).toBe(false);
    act(() => result.current.handleAnswerSubmit(0, 0));
    act(() => vi.advanceTimersByTime(1600));
    expect(result.current.quizResult?.score).toBe(0);
  });
  it("cancels stale work on unmount and rejects invalid submission", () => {
    vi.useFakeTimers();
    const complete = vi.fn();
    const problems = [{ id: 0, text: "0 + 0 = " }];
    const { result, unmount } = renderHook(() => useQuizController(problems, t, complete));
    act(() => {
      result.current.handleAnswerSubmit(1, 0);
      result.current.handleAnswerSubmit(0, Infinity);
    });
    expect(result.current.quizProblems[0].isAnswered).toBe(false);
    act(() => result.current.handleAnswerSubmit(0, 0));
    unmount();
    act(() => vi.advanceTimersByTime(2000));
    expect(complete).not.toHaveBeenCalled();
  });
  it("navigation cancels auto-advance rather than overriding user choice", () => {
    vi.useFakeTimers();
    const problems = [
      { id: 0, text: "2 + 3 = " },
      { id: 1, text: "1 + 1 = " },
      { id: 2, text: "2 + 2 = " },
    ];
    const { result } = renderHook(() => useQuizController(problems, t, vi.fn()));
    act(() => result.current.handleAnswerSubmit(0, 5));
    act(() => {
      result.current.goToNext();
      result.current.goToNext();
    });
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.currentProblemIndex).toBe(2);
    act(() => result.current.goToPrevious());
    expect(result.current.currentProblemIndex).toBe(1);
  });
});
