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

  if (showResults && quizResult) {
    return (
      <QuizResults
        t={t}
        quizResult={quizResult}
        quizProblems={quizProblems}
        timeElapsed={timeElapsed}
        formatTime={formatTime}
        onExitQuiz={onExitQuiz}
        onRetry={() => {
          setShowResults(false);
          setCurrentProblemIndex(0);
          setQuizProblems((prev: Problem[]) =>
            prev.map((p: Problem) => ({
              ...p,
              userAnswer: undefined,
              isCorrect: false,
              isAnswered: false,
            }))
          );
          setTimeElapsed(0);
        }}
      />
    );
  }

  const QUIZ_LOADING_KEY = 'quiz.loading';
  if (quizProblems.length === 0) {
    return <div className='quiz-loading'>{t(QUIZ_LOADING_KEY)}</div>;
  }

  const currentProblem = quizProblems[currentProblemIndex];
  const progress = ((currentProblemIndex + 1) / quizProblems.length) * 100;

  // Calculate progress percentage for inline style
  const progressPercentage = Math.round(progress);

  // If current problem doesn't exist, return loading state
  if (!currentProblem) {
    return <div className='quiz-loading'>{t(QUIZ_LOADING_KEY)}</div>;
  }

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

export default QuizMode;
