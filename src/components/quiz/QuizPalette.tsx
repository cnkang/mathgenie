import type { Problem } from "@/types";
import React from "react";

type QuizPaletteProps = {
  t: (key: string, params?: Record<string, string | number>) => string;
  problems: Problem[];
  currentIndex: number;
  onSelect: (index: number) => void;
};

// Keep the DOM bounded for very large quizzes; navigation buttons and
// keyboard arrows still reach every problem beyond the cap.
const MAX_PALETTE_ITEMS = 200;

const stateOf = (problem: Problem): "correct" | "incorrect" | "unanswered" => {
  if (!problem.isAnswered) return "unanswered";
  if (problem.isCorrect) return "correct";
  return "incorrect";
};

/**
 * Collapsible question palette: jump to any problem and see answered /
 * correct / incorrect state at a glance.
 */
const QuizPalette: React.FC<QuizPaletteProps> = ({ t, problems, currentIndex, onSelect }) => {
  const answered = problems.filter((problem) => problem.isAnswered).length;
  const title = t("quiz.palette.title", { answered, total: problems.length });
  const visible = problems.slice(0, MAX_PALETTE_ITEMS);

  return (
    <details className="quiz-palette">
      <summary className="quiz-palette-toggle">{title}</summary>
      <div className="quiz-palette-grid" role="group" aria-label={title}>
        {visible.map((problem, index) => {
          const state = stateOf(problem);
          const isCurrent = index === currentIndex;
          return (
            <button
              key={problem.id}
              type="button"
              className={`palette-item ${state}${isCurrent ? " current" : ""}`}
              aria-label={t("quiz.palette.jumpLabel", {
                number: index + 1,
                state: t(`quiz.palette.${state}`),
              })}
              aria-current={isCurrent ? "true" : undefined}
              onClick={() => onSelect(index)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      {problems.length > MAX_PALETTE_ITEMS && (
        <p className="quiz-palette-note">
          {t("quiz.palette.truncated", { count: MAX_PALETTE_ITEMS })}
        </p>
      )}
    </details>
  );
};

export default QuizPalette;
