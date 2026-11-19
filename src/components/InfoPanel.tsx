import React, { useEffect, useRef, useState } from "react";
import { useProgressBar } from "../hooks/useProgressBar";
import { useTranslation } from "../i18n";
import type { Problem, QuizResult, Settings } from "../types";
import { safeStorage } from "../utils/safeStorage";
import "./InfoPanel.css";

interface InfoPanelProps {
  problems: Problem[];
  settings: Settings;
  quizResult?: QuizResult | null;
  /** Monotonic counter of explicit user generations (App-owned). Settings
   * edits auto-regenerate problems but must not inflate lifetime stats. */
  explicitGenerations?: number;
}

const SESSION_STATS_KEY = "mathgenie-session-stats";

type SessionStats = {
  totalGenerated: number;
  sessionsCount: number;
  lastCountedGeneration: number;
};

// Module-level so remounts (e.g. leaving and re-entering quiz mode) cannot
// count the same problem batch twice; WeakSet keeps no arrays alive.
const countedBatches = new WeakSet<Problem[]>();

const isValidCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

/**
 * Read persisted stats. Accepts the current format and legacy records
 * (no lastCountedGeneration); negative/nonfinite totals are rejected.
 * Records without a cursor (legacy or missing field) adopt the current
 * explicit-generation counter, as do missing/corrupt records, so the
 * batch auto-generated on load is never miscounted as explicit. A stored
 * cursor above the restored counter is clamped so crediting cannot be
 * suppressed by a stale or lost counter key.
 */
const readStoredStats = (legacyCursor: number): SessionStats => {
  const raw = safeStorage.get(SESSION_STATS_KEY);
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        const candidate = parsed as Partial<SessionStats>;
        if (isValidCount(candidate.totalGenerated) && isValidCount(candidate.sessionsCount)) {
          return {
            totalGenerated: candidate.totalGenerated,
            sessionsCount: candidate.sessionsCount,
            lastCountedGeneration: isValidCount(candidate.lastCountedGeneration)
              ? Math.min(candidate.lastCountedGeneration, legacyCursor)
              : legacyCursor,
          };
        }
      }
    } catch {
      /* Corrupt storage: fall through to a fresh cursor. */
    }
  }
  return { totalGenerated: 0, sessionsCount: 0, lastCountedGeneration: legacyCursor };
};

// Extracted to top-level to avoid redefining on each render (Sonar S6478)
const ProgressBar: React.FC<{ value: number }> = ({ value }) => {
  const { progressBarProps, progressFillProps } = useProgressBar({ value });
  return (
    <div {...progressBarProps}>
      <div {...progressFillProps}></div>
    </div>
  );
};

const ChartIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path
      d="M4 20h16M7 16V9m5 7V5m5 11v-8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const TargetIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

const TrophyIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path
      d="M8 4h8v2a4 4 0 0 1-8 0V4Zm-3 2h3a4 4 0 0 1-3 3V6Zm14 0h-3a4 4 0 0 0 3 3V6ZM9 20h6m-5-3h4m-2-2v2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InfoPanel: React.FC<InfoPanelProps> = ({
  problems,
  settings,
  quizResult,
  explicitGenerations = 0,
}) => {
  const { t } = useTranslation();
  const [sessionStats, setSessionStats] = useState<SessionStats>(() =>
    readStoredStats(explicitGenerations),
  );
  // The batch present at mount is "already seen": only arrays arriving in
  // later renders are eligible for credit, so a click that produces no new
  // batch (validation failure) can never credit what is already on screen,
  // and the auto-generated batch after a reload is never miscounted.
  const prevProblemsRef = useRef<Problem[]>(problems);

  useEffect(() => {
    const isNewArrival = problems !== prevProblemsRef.current;
    prevProblemsRef.current = problems;
    // Credit only a newly arrived batch from an explicit generation the
    // user has not been credited for yet, and never the same array twice.
    // The cursor jumps to the current counter on credit so uncredited
    // clicks leave no lag for auto batches to slip into.
    if (
      problems.length > 0 &&
      isNewArrival &&
      explicitGenerations > sessionStats.lastCountedGeneration &&
      !countedBatches.has(problems)
    ) {
      countedBatches.add(problems);
      setSessionStats((prev) => ({
        totalGenerated: prev.totalGenerated + problems.length,
        sessionsCount: prev.sessionsCount + 1,
        lastCountedGeneration: explicitGenerations,
      }));
    }
  }, [problems, explicitGenerations, sessionStats.lastCountedGeneration]);

  // Persist lifetime generation stats so "Total Generated" survives reloads.
  useEffect(() => {
    safeStorage.set(SESSION_STATS_KEY, JSON.stringify(sessionStats));
  }, [sessionStats]);

  interface StatsResult {
    totalProblems: number;
    averageComplexity: number;
    operationTypes: number;
    difficultyLevel: string;
  }

  // Calculate statistics
  const calculateStats = (): StatsResult => {
    if (problems.length === 0) {
      return {
        totalProblems: 0,
        averageComplexity: 0,
        operationTypes: 0,
        difficultyLevel: t("infoPanel.difficulty.beginner"),
      };
    }

    const operationTypes = settings.operations.length;
    const numberRange = settings.numRange[1] - settings.numRange[0];
    const averageOperands = (settings.numOperandsRange[0] + settings.numOperandsRange[1]) / 2;
    const complexity = (numberRange * operationTypes * averageOperands) / 100;

    let difficultyLevel = t("infoPanel.difficulty.beginner");
    if (complexity > 2) {
      difficultyLevel = t("infoPanel.difficulty.intermediate");
    }
    if (complexity > 5) {
      difficultyLevel = t("infoPanel.difficulty.advanced");
    }
    if (complexity > 10) {
      difficultyLevel = t("infoPanel.difficulty.expert");
    }

    return {
      totalProblems: problems.length,
      averageComplexity: Math.round(complexity * 10) / 10,
      operationTypes,
      difficultyLevel,
    };
  };

  const stats = calculateStats();
  const learningProgress = Math.min((sessionStats.totalGenerated / 100) * 100, 100);

  return (
    <div className="info-panel">
      <h2 className="section-title">
        <span className="section-icon" aria-hidden="true">
          <ChartIcon />
        </span>
        {t("infoPanel.title")}
      </h2>

      <div className="stats-grid">
        <div
          className="stat-card"
          aria-label={`${t("infoPanel.stats.currentProblems")}: ${stats.totalProblems}`}
        >
          <span className="stat-value">{stats.totalProblems}</span>
          <div className="stat-label">{t("infoPanel.stats.currentProblems")}</div>
        </div>

        <div
          className="stat-card"
          aria-label={`${t("infoPanel.stats.totalGenerated")}: ${sessionStats.totalGenerated}`}
        >
          <span className="stat-value">{sessionStats.totalGenerated}</span>
          <div className="stat-label">{t("infoPanel.stats.totalGenerated")}</div>
        </div>

        <div
          className="stat-card"
          aria-label={`${t("infoPanel.stats.difficultyLevel")}: ${stats.difficultyLevel}`}
        >
          <span className="stat-value">{stats.difficultyLevel}</span>
          <div className="stat-label">{t("infoPanel.stats.difficultyLevel")}</div>
        </div>

        <div
          className="stat-card"
          aria-label={`${t("infoPanel.stats.operationTypes")}: ${stats.operationTypes}`}
        >
          <span className="stat-value">{stats.operationTypes}</span>
          <div className="stat-label">{t("infoPanel.stats.operationTypes")}</div>
        </div>
      </div>

      <div className="progress-section">
        <h3 className="section-title">
          <span className="section-icon" aria-hidden="true">
            <TargetIcon />
          </span>
          {t("infoPanel.progress.title")}
        </h3>
        <ProgressBar value={learningProgress} />
        <div className="progress-text">
          {t("infoPanel.progress.completed", { percent: Math.round(learningProgress) })}
        </div>
      </div>

      {quizResult && (
        <div className="tips-section">
          <h3 className="section-title">
            <span className="section-icon" aria-hidden="true">
              <TrophyIcon />
            </span>
            {t("infoPanel.recentResults.title")}
          </h3>
          <div className="quiz-result-summary">
            <div className="result-item">
              <span className="result-label">
                {t("infoPanel.recentResults.score", { score: quizResult.score })}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">{t("infoPanel.recentResults.grade")}</span>
              <span className="result-value">{quizResult.grade}</span>
            </div>
            <div className="result-item">
              <span className="result-label">{t("infoPanel.recentResults.accuracy")}</span>
              <span className="result-value">
                {Math.round((quizResult.correctAnswers / quizResult.totalProblems) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoPanel;
