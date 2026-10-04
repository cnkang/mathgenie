import { safeEvaluateExpression } from "@/domain/expression";
import type { Problem, QuizResult } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
export type Translator = (key: string, params?: Record<string, string | number>) => string;

const prepareProblems = (problems: Problem[]): Problem[] =>
  problems.map((problem) => {
    const expression = problem.text.split("=")[0].trim();
    const correctAnswer = problem.correctAnswer ?? safeEvaluateExpression(expression);
    if (!Number.isFinite(correctAnswer)) throw new Error("Invalid problem answer");
    return {
      ...problem,
      text: `${expression} = `,
      correctAnswer,
      userAnswer: undefined,
      isCorrect: false,
      isAnswered: false,
    };
  });
const gradeForScore = (score: number): string => {
  if (score >= 90) return "excellent";
  if (score >= 80) return "good";
  if (score >= 70) return "average";
  if (score >= 60) return "passing";
  return "needsImprovement";
};
const computeQuizResult = (problems: Problem[], t: Translator): QuizResult => {
  const correctAnswers = problems.filter((problem) => problem.isCorrect).length;
  const score = problems.length ? Math.round((correctAnswers / problems.length) * 100) : 0;
  const grade = gradeForScore(score);
  return {
    totalProblems: problems.length,
    correctAnswers,
    incorrectAnswers: problems.length - correctAnswers,
    score,
    grade: t(`quiz.grades.${grade}`),
    feedback: t(`quiz.feedback.${grade}`),
  };
};

export const useQuizController = (
  problems: Problem[],
  t: Translator,
  onQuizComplete: (result: QuizResult) => void,
) => {
  const [quizProblems, setQuizProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const startedAt = useRef(Date.now());
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finished = useRef(false);
  const state = useRef(quizProblems);
  const latest = useRef({ t, onQuizComplete });
  state.current = quizProblems;
  latest.current = { t, onQuizComplete };

  const cancelAdvance = useCallback(() => {
    if (pending.current !== null) clearTimeout(pending.current);
    pending.current = null;
  }, []);
  const restartQuiz = useCallback(() => {
    cancelAdvance();
    finished.current = false;
    const prepared = prepareProblems(problems);
    state.current = prepared;
    setQuizProblems(prepared);
    setCurrentProblemIndex(0);
    setShowResults(false);
    setQuizResult(null);
    startedAt.current = Date.now();
    setTimeElapsed(0);
  }, [problems, cancelAdvance]);
  useEffect(() => {
    restartQuiz();
    return cancelAdvance;
  }, [restartQuiz, cancelAdvance]);
  useEffect(() => {
    if (showResults) return;
    const timer = setInterval(
      () => setTimeElapsed(Math.floor((Date.now() - startedAt.current) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [showResults]);

  const finishQuiz = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    const result = computeQuizResult(state.current, latest.current.t);
    setTimeElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    setQuizResult(result);
    setShowResults(true);
    latest.current.onQuizComplete(result);
  }, []);
  // Returning to an answered final problem must still allow completion.
  useEffect(() => {
    if (
      currentProblemIndex === state.current.length - 1 &&
      state.current[currentProblemIndex]?.isAnswered
    ) {
      cancelAdvance();
      pending.current = setTimeout(finishQuiz, 1500);
    }
    return cancelAdvance;
  }, [currentProblemIndex, finishQuiz, cancelAdvance]);

  const handleAnswerSubmit = useCallback(
    (problemId: number, answer: number) => {
      const problem = state.current[currentProblemIndex];
      if (
        !Number.isFinite(answer) ||
        finished.current ||
        problem?.id !== problemId ||
        problem.isAnswered
      )
        return;
      cancelAdvance();
      const updated = state.current.map((item) =>
        item.id === problemId
          ? {
              ...item,
              userAnswer: answer,
              isCorrect: Math.abs(answer - (item.correctAnswer ?? Number.NaN)) < 0.001,
              isAnswered: true,
            }
          : item,
      );
      state.current = updated;
      setQuizProblems(updated);
      pending.current = setTimeout(() => {
        pending.current = null;
        if (currentProblemIndex < updated.length - 1) {
          setCurrentProblemIndex(currentProblemIndex + 1);
          return;
        }
        finishQuiz();
      }, 1500);
    },
    [currentProblemIndex, cancelAdvance, finishQuiz],
  );

  const goToPrevious = useCallback(() => {
    cancelAdvance();
    setCurrentProblemIndex((index) => Math.max(0, index - 1));
  }, [cancelAdvance]);
  const goToNext = useCallback(() => {
    cancelAdvance();
    setCurrentProblemIndex((index) => Math.min(state.current.length - 1, index + 1));
  }, [cancelAdvance]);
  const adjustTimeElapsed = useCallback((value: number) => {
    startedAt.current = Date.now() - value * 1000;
    setTimeElapsed(value);
  }, []);
  const formatTime = useCallback(
    (seconds: number) =>
      `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`,
    [],
  );
  return {
    quizProblems,
    setQuizProblems,
    currentProblemIndex,
    setCurrentProblemIndex,
    showResults,
    setShowResults,
    quizResult,
    setQuizResult,
    timeElapsed,
    setTimeElapsed: adjustTimeElapsed,
    handleAnswerSubmit,
    goToPrevious,
    goToNext,
    formatTime,
    restartQuiz,
  };
};
