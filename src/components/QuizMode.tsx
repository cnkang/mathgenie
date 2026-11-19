import React from "react";
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

  // Arrow keys navigate between problems, except while the user is editing
  // a non-empty answer (caret keys must keep working) or composing IME input.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.nativeEvent.isComposing) {
      return;
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }
    const target = event.target as HTMLElement;
    if (target instanceof HTMLInputElement && !target.disabled && target.value !== "") {
      return;
    }
    // Leave arrow keys to controls that use them natively.
    if (target.closest("details, select, textarea, [role='radiogroup'], [role='slider']")) {
      return;
    }
    event.preventDefault();
    if (event.key === "ArrowLeft") {
      goToPrevious();
    } else {
      goToNext();
    }
  };

  return (
    // SONAR-SAFE (S6848): this is an event-delegation container, not an
    // interactive widget; the real interactive targets (native inputs and
    // buttons) bubble their key events here.
    <div className="quiz-mode" onKeyDown={handleKeyDown}>
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
