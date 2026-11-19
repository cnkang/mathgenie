import React from "react";

type Props = {
  t: (key: string, params?: Record<string, string | number>) => string;
  canPrev: boolean;
  canNext: boolean;
  canFinish: boolean;
  isAdvancing: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
};

const QuizNavigation: React.FC<Props> = ({
  t,
  canPrev,
  canNext,
  canFinish,
  isAdvancing,
  onPrev,
  onNext,
  onFinish,
}) => (
  <div className="quiz-navigation">
    <button type="button" onClick={onPrev} disabled={!canPrev} className="nav-btn prev-btn">
      {t("quiz.previousProblem")}
    </button>
    {canFinish && (
      <button type="button" onClick={onFinish} className="nav-btn finish-btn">
        {t("quiz.finishEarly")}
      </button>
    )}
    <button
      type="button"
      onClick={onNext}
      disabled={!canNext}
      className={`nav-btn next-btn${isAdvancing && canNext ? " nav-btn-urgent" : ""}`}
    >
      {t("quiz.nextProblem")}
    </button>
  </div>
);

export default QuizNavigation;
