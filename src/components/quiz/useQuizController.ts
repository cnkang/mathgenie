import { useEffect, useState, useCallback } from 'react';
import type { Problem, QuizResult } from '@/types';
import { safeEvaluateExpression } from '@/components/quiz/expression';

export type Translator = (key: string, params?: Record<string, string | number>) => string;

const mapProblemsWithAnswers = (problems: Problem[]): Problem[] =>
  problems.map(problem => {
    const expression = problem.text
      .replace(' = ', '')
      .replace(/[✖×]/g, '*')
      .replace(/[➗÷]/g, '/');
    let correctAnswer: number;
    try {
      correctAnswer = safeEvaluateExpression(expression);
    } catch {
      console.error('Error calculating answer for:', expression);
      correctAnswer = 0;
    }
    return {
      ...problem,
      correctAnswer,
      userAnswer: undefined,
      isCorrect: false,
      isAnswered: false,
    };
  });

const computeQuizResult = (problems: Problem[], t: Translator): QuizResult => {
  const correctAnswers = problems.filter(p => p.isCorrect).length;
  const totalProblems = problems.length;
  const score = Math.round((correctAnswers / totalProblems) * 100);
  let grade = t('quiz.grades.needsImprovement');
  let feedback = t('quiz.feedback.needsImprovement');
  if (score >= 90) {
    grade = t('quiz.grades.excellent');
    feedback = t('quiz.feedback.excellent');
  } else if (score >= 80) {
    grade = t('quiz.grades.good');
    feedback = t('quiz.feedback.good');
  } else if (score >= 70) {
    grade = t('quiz.grades.average');
    feedback = t('quiz.feedback.average');
  } else if (score >= 60) {
    grade = t('quiz.grades.passing');
    feedback = t('quiz.feedback.passing');
  }
  return {
    totalProblems,
    correctAnswers,
    incorrectAnswers: totalProblems - correctAnswers,
    score,
    grade,
    feedback,
  };
};

export const useQuizController = (
  problems: Problem[],
  t: Translator,
  onQuizComplete: (result: QuizResult) => void
) => {
  const [quizProblems, setQuizProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Initialize problems with computed answers
  useEffect(() => {
    const problemsWithAnswers = mapProblemsWithAnswers(problems);
    setQuizProblems(problemsWithAnswers);
    setCurrentProblemIndex(0);
    setShowResults(false);
    setQuizResult(null);
    setTimeElapsed(0);
  }, [problems]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const finishQuiz = useCallback(
    (finalProblems?: Problem[]): void => {
      const problemsToUse = finalProblems || quizProblems;
      const result = computeQuizResult(problemsToUse, t);
      setQuizResult(result);
      setShowResults(true);
      onQuizComplete(result);
    },
    [quizProblems, t, onQuizComplete]
  );

  const handleAnswerSubmit = useCallback(
    (problemId: number, answer: number): void => {
      setQuizProblems(prev => {
        const updatedProblems = prev.map(problem =>
          problem.id === problemId
            ? {
                ...problem,
                userAnswer: answer,
                isCorrect: Math.abs(answer - (problem.correctAnswer || 0)) < 0.001,
                isAnswered: true,
              }
            : problem
        );
        setTimeout(() => {
          const isLast = currentProblemIndex >= updatedProblems.length - 1;
          if (isLast) {
            finishQuiz(updatedProblems);
          } else {
            setCurrentProblemIndex(currentProblemIndex + 1);
          }
        }, 1500);
        return updatedProblems;
      });
    },
    [finishQuiz, currentProblemIndex]
  );

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const goToPrevious = useCallback((): void => {
    setCurrentProblemIndex(idx => (idx > 0 ? idx - 1 : 0));
  }, []);

  const goToNext = useCallback((): void => {
    setCurrentProblemIndex(idx => (idx < quizProblems.length - 1 ? idx + 1 : idx));
  }, [quizProblems.length]);

  return {
    quizProblems,
    currentProblemIndex,
    showResults,
    quizResult,
    timeElapsed,
    handleAnswerSubmit,
    formatTime,
    goToPrevious,
    goToNext,
    setShowResults,
    setCurrentProblemIndex,
    setQuizProblems,
    setTimeElapsed,
  } as const;
};
