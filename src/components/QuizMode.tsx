import React from 'react';
import { useTranslation } from '../i18n';
import type { Problem, QuizResult } from '../types';
import InteractiveProblem from './InteractiveProblem';
import QuizResults from '@/components/quiz/QuizResults';
import QuizHeader from '@/components/quiz/QuizHeader';
import QuizNavigation from '@/components/quiz/QuizNavigation';
import { useQuizController } from '@/components/quiz/useQuizController';

// math evaluation moved to quiz/expression.ts

interface QuizModeProps {
  problems: Problem[];
  onQuizComplete: (result: QuizResult) => void;
  onExitQuiz: () => void;
}

const QUIZ_LOADING_KEY = 'quiz.loading';

const renderLoadingState = (
  translate: (key: string, params?: Record<string, string | number>) => string
) => <div className='quiz-loading'>{translate(QUIZ_LOADING_KEY)}</div>;

const renderResults = (params: {
  t: (key: string, params?: Record<string, string | number>) => string;
  quizResult: QuizResult;
  quizProblems: Problem[];
  timeElapsed: number;
  formatTime: (seconds: number) => string;
  onExitQuiz: () => void;
  onRetry: () => void;
}) => {
  const { t, quizResult, quizProblems, timeElapsed, formatTime, onExitQuiz, onRetry } = params;
  return (
    <QuizResults
      t={t}
      quizResult={quizResult}
      quizProblems={quizProblems}
      timeElapsed={timeElapsed}
      formatTime={formatTime}
      onExitQuiz={onExitQuiz}
      onRetry={onRetry}
    />
  );
};

const renderQuizLayout = (params: {
  t: (key: string, params?: Record<string, string | number>) => string;
  quizProblems: Problem[];
  currentProblemIndex: number;
  timeElapsed: number;
  formatTime: (seconds: number) => string;
  onExitQuiz: () => void;
  handleAnswerSubmit: (problemId: number, answer: number) => void;
  goToPrevious: () => void;
  goToNext: () => void;
}) => {
  const {
    t,
    quizProblems,
    currentProblemIndex,
    timeElapsed,
    formatTime,
    onExitQuiz,
    handleAnswerSubmit,
    goToPrevious,
    goToNext,
  } = params;

  const currentProblem = quizProblems[currentProblemIndex];
  const progress = ((currentProblemIndex + 1) / quizProblems.length) * 100;
  const progressPercentage = Math.round(progress);

  return (
    <div className='quiz-mode'>
      <QuizHeader
        t={t}
        progressPercentage={progressPercentage}
        current={currentProblemIndex + 1}
        total={quizProblems.length}
        timeElapsed={timeElapsed}
        formatTime={formatTime}
        onExit={onExitQuiz}
      />

      <div className='quiz-content'>
        <div className='current-problem'>
          <h3>{t('quiz.problemNumber', { number: currentProblemIndex + 1 })}</h3>
          <InteractiveProblem
            problem={currentProblem}
            onAnswerSubmit={handleAnswerSubmit}
            showResult={currentProblem?.isAnswered || false}
          />
        </div>

        <QuizNavigation
          t={t}
          canPrev={currentProblemIndex > 0}
          canNext={currentProblemIndex < quizProblems.length - 1}
          onPrev={goToPrevious}
          onNext={goToNext}
        />
      </div>
    </div>
  );
};

const QuizMode: React.FC<QuizModeProps> = ({ problems, onQuizComplete, onExitQuiz }) => {
  const { t } = useTranslation();
  const {
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
  } = useQuizController(problems, t, onQuizComplete);

  const resetQuizState = (): void => {
    setShowResults(false);
    setCurrentProblemIndex(0);
    setQuizProblems(prev =>
      prev.map(problem => ({
        ...problem,
        userAnswer: undefined,
        isCorrect: false,
        isAnswered: false,
      }))
    );
    setTimeElapsed(0);
  };

  if (showResults && quizResult) {
    return renderResults({
      t,
      quizResult,
      quizProblems,
      timeElapsed,
      formatTime,
      onExitQuiz,
      onRetry: resetQuizState,
    });
  }

  if (quizProblems.length === 0) {
    return renderLoadingState(t);
  }

  const currentProblem = quizProblems[currentProblemIndex];
  if (!currentProblem) {
    return renderLoadingState(t);
  }

  return renderQuizLayout({
    t,
    quizProblems,
    currentProblemIndex,
    timeElapsed,
    formatTime,
    onExitQuiz,
    handleAnswerSubmit,
    goToPrevious,
    goToNext,
  });
};

export default QuizMode;
