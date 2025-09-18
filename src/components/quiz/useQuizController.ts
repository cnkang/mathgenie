import { safeEvaluateExpression } from '@/components/quiz/expression';
import type { Problem, QuizResult } from '@/types';
import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

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

const useQuizProblemState = (problems: Problem[]) => {
  const [quizProblems, setQuizProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    const problemsWithAnswers = mapProblemsWithAnswers(problems);
    setQuizProblems(problemsWithAnswers);
    setCurrentProblemIndex(0);
    setShowResults(false);
    setQuizResult(null);
  }, [problems]);

  return {
    quizProblems,
    setQuizProblems,
    currentProblemIndex,
    setCurrentProblemIndex,
    showResults,
    setShowResults,
    quizResult,
    setQuizResult,
  } as const;
};

const useQuizTimer = () => {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const resetTimer = useCallback(() => setTimeElapsed(0), []);

  return { timeElapsed, setTimeElapsed, resetTimer } as const;
};

const useFinishQuiz = (
  quizProblems: Problem[],
  t: Translator,
  onQuizComplete: (result: QuizResult) => void,
  setQuizResult: (value: QuizResult | null) => void,
  setShowResults: (value: boolean) => void
) => {
  return useCallback(
    (finalProblems?: Problem[]): void => {
      const problemsToUse = finalProblems ?? quizProblems;
      const result = computeQuizResult(problemsToUse, t);
      setQuizResult(result);
      setShowResults(true);
      onQuizComplete(result);
    },
    [quizProblems, t, onQuizComplete, setQuizResult, setShowResults]
  );
};

const useAnswerSubmission = (params: {
  setQuizProblems: Dispatch<SetStateAction<Problem[]>>;
  finishQuiz: (finalProblems?: Problem[]) => void;
  currentProblemIndex: number;
  setCurrentProblemIndex: Dispatch<SetStateAction<number>>;
}) => {
  const { setQuizProblems, finishQuiz, currentProblemIndex, setCurrentProblemIndex } = params;

  return useCallback(
    (problemId: number, answer: number): void => {
      setQuizProblems(prevProblems => {
        const updatedProblems = prevProblems.map(problem =>
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
            return;
          }
          setCurrentProblemIndex(currentProblemIndex + 1);
        }, 1500);

        return updatedProblems;
      });
    },
    [currentProblemIndex, finishQuiz, setCurrentProblemIndex, setQuizProblems]
  );
};

const useQuizNavigation = (
  currentProblemIndex: number,
  setCurrentProblemIndex: Dispatch<SetStateAction<number>>,
  quizProblemsLength: number
) => {
  const goToPrevious = useCallback((): void => {
    setCurrentProblemIndex(idx => (idx > 0 ? idx - 1 : 0));
  }, [setCurrentProblemIndex]);

  const goToNext = useCallback((): void => {
    setCurrentProblemIndex(idx => (idx < quizProblemsLength - 1 ? idx + 1 : idx));
  }, [setCurrentProblemIndex, quizProblemsLength]);

  return { goToPrevious, goToNext };
};

const useQuizActions = (
  problems: Problem[],
  quizProblems: Problem[],
  t: Translator,
  onQuizComplete: (result: QuizResult) => void,
  setQuizProblems: Dispatch<SetStateAction<Problem[]>>,
  setQuizResult: (value: QuizResult | null) => void,
  setShowResults: (value: boolean) => void,
  currentProblemIndex: number,
  setCurrentProblemIndex: (value: number | ((prev: number) => number)) => void,
  resetTimer: () => void
) => {
  const finishQuiz = useFinishQuiz(quizProblems, t, onQuizComplete, setQuizResult, setShowResults);

  const handleAnswerSubmit = useAnswerSubmission({
    setQuizProblems,
    finishQuiz,
    currentProblemIndex,
    setCurrentProblemIndex,
  });

  useEffect(() => {
    resetTimer();
  }, [resetTimer, problems]);

  return { handleAnswerSubmit };
};

export const useQuizController = (
  problems: Problem[],
  t: Translator,
  onQuizComplete: (result: QuizResult) => void
) => {
  const problemState = useQuizProblemState(problems);
  const timerState = useQuizTimer();

  const navigation = useQuizNavigation(
    problemState.currentProblemIndex,
    problemState.setCurrentProblemIndex,
    problemState.quizProblems.length
  );

  const actions = useQuizActions(
    problems,
    problemState.quizProblems,
    t,
    onQuizComplete,
    problemState.setQuizProblems,
    problemState.setQuizResult,
    problemState.setShowResults,
    problemState.currentProblemIndex,
    problemState.setCurrentProblemIndex,
    timerState.resetTimer
  );

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    ...problemState,
    ...timerState,
    ...navigation,
    ...actions,
    formatTime,
  } as const;
};
