import React, { useEffect } from "react";
import { useTranslation } from "../i18n";
import type { Problem, QuizResult } from "../types";
import InteractiveProblem from "./InteractiveProblem";
import QuizResults from "@/components/quiz/QuizResults";
import QuizHeader from "@/components/quiz/QuizHeader";
import QuizNavigation from "@/components/quiz/QuizNavigation";
import QuizPalette from "@/components/quiz/QuizPalette";
import { useQuizController } from "@/components/quiz/useQuizController";

// math evaluation moved to quiz/expression.ts

interface QuizModeProps {
  problems: Problem[];
  onQuizComplete: (result: QuizResult) => void;
  onExitQuiz: () => void;
}

const QUIZ_LOADING_KEY = "quiz.loading";

// Arrow-key navigation must not steal caret keys while the user edits a
// non-empty answer or composes IME input, and controls that use arrow keys
// natively keep their behavior.
const isQuizArrowNavigationAllowed = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target instanceof HTMLInputElement && !target.disabled && target.value !== "") {
    return false;
  }
  return !target.closest("details, select, textarea, [role='radiogroup'], [role='slider']");
};

const renderLoadingState = (
  translate: (key: string, params?: Record<string, string | number>) => string,
) => <div className="quiz-loading">{translate(QUIZ_LOADING_KEY)}</div>;

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
  isAdvancing: boolean;
  formatTime: (seconds: number) => string;
  onExitQuiz: () => void;
  handleAnswerSubmit: (problemId: number, answer: number) => void;
  goToPrevious: () => void;
  goToNext: () => void;
  goToIndex: (index: number) => void;
  finishEarly: () => void;
}) => {
  const {
    t,
    quizProblems,
    currentProblemIndex,
    timeElapsed,
    isAdvancing,
    formatTime,
    onExitQuiz,
    handleAnswerSubmit,
    goToPrevious,
    goToNext,
    goToIndex,
    finishEarly,
  } = params;

  const currentProblem = quizProblems[currentProblemIndex];
  const progress = ((currentProblemIndex + 1) / quizProblems.length) * 100;
  const progressPercentage = Math.round(progress);
  const answeredCount = quizProblems.filter((problem) => problem.isAnswered).length;

  return (
    <div className="quiz-mode">
      <QuizHeader
        t={t}
        progressPercentage={progressPercentage}
        current={currentProblemIndex + 1}
        total={quizProblems.length}
        timeElapsed={timeElapsed}
        answeredCount={answeredCount}
        formatTime={formatTime}
        onExit={onExitQuiz}
      />

      <QuizPalette
        t={t}
        problems={quizProblems}
        currentIndex={currentProblemIndex}
        onSelect={goToIndex}
      />

      <div className="quiz-content">
        <div className="current-problem">
          <h3>{t("quiz.problemNumber", { number: currentProblemIndex + 1 })}</h3>
          <InteractiveProblem
            key={currentProblem.id}
            problem={currentProblem}
            onAnswerSubmit={handleAnswerSubmit}
            showResult={currentProblem?.isAnswered || false}
          />
        </div>

        <QuizNavigation
          t={t}
          canPrev={currentProblemIndex > 0}
          canNext={currentProblemIndex < quizProblems.length - 1}
          canFinish={answeredCount > 0}
          isAdvancing={isAdvancing}
          onPrev={goToPrevious}
          onNext={goToNext}
          onFinish={finishEarly}
        />
        <p className="quiz-keyboard-hint">{t("quiz.keyboardHint")}</p>
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
    isAdvancing,
    handleAnswerSubmit,
    formatTime,
    goToPrevious,
    goToNext,
    goToIndex,
    finishEarly,
    restartQuiz,
  } = useQuizController(problems, t, onQuizComplete);

  const quizVisible = !showResults && quizProblems.length > 0;

  useEffect(() => {
    if (!quizVisible) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.isComposing) {
        return;
      }
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }
      if (!isQuizArrowNavigationAllowed(event.target)) {
        return;
      }
      event.preventDefault();
      if (event.key === "ArrowLeft") {
        goToPrevious();
      } else {
        goToNext();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [quizVisible, goToPrevious, goToNext]);

  if (showResults && quizResult) {
    return renderResults({
      t,
      quizResult,
      quizProblems,
      timeElapsed,
      formatTime,
      onExitQuiz,
      onRetry: restartQuiz,
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
    isAdvancing,
    formatTime,
    onExitQuiz,
    handleAnswerSubmit,
    goToPrevious,
    goToNext,
    goToIndex,
    finishEarly,
  });
};

export default QuizMode;
