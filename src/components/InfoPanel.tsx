import React, { useEffect, useState } from 'react';
import { useProgressBar } from '../hooks/useProgressBar';
import { useTranslation } from '../i18n';
import type { Problem, QuizResult, Settings } from '../types';
import LoadingButton from './LoadingButton';

// Do not edit manually.
const STR_STAT_CARD = 'stat-card' as const;
const STR_STAT_VALUE = 'stat-value' as const;
const STR_STAT_LABEL = 'stat-label' as const;
const STR_TIPS_SECTION = 'tips-section' as const;
const STR_QUICK_ACTION_CARD = 'quick-action-card' as const;
const STR_QUICK_ACTION_CONTENT = 'quick-action-content' as const;
const STR_QUICK_ACTION_ICON = 'quick-action-icon' as const;
const STR_QUICK_ACTION_TEXT = 'quick-action-text' as const;
const STR_QUICK_ACTION_LABEL = 'quick-action-label' as const;
const STR_RESULT_ITEM = 'result-item' as const;
const STR_RESULT_LABEL = 'result-label' as const;

interface InfoPanelProps {
  problems: Problem[];
  settings: Settings;
  onGenerateProblems?: () => void;
  onDownloadPdf?: () => Promise<void>;
  quizResult?: QuizResult | null;
  onStartQuiz?: () => void;
}

// Extracted to top-level to avoid redefining on each render (Sonar S6478)
const ProgressBar: React.FC<{ value: number }> = ({ value }) => {
  const { progressBarProps, progressFillProps } = useProgressBar({ value });
  return (
    <div {...progressBarProps}>
      <div {...progressFillProps}></div>
    </div>
  );
};

const InfoPanel: React.FC<InfoPanelProps> = ({
  problems,
  settings,
  onGenerateProblems,
  onDownloadPdf,
  quizResult,
  onStartQuiz,
}) => {
  const { t } = useTranslation();
  const [sessionStats, setSessionStats] = useState({
    totalGenerated: 0,
    sessionsCount: 1,
  });

  useEffect(() => {
    if (problems.length > 0) {
      setSessionStats(prev => ({
        totalGenerated: prev.totalGenerated + problems.length,
        sessionsCount: prev.sessionsCount + (problems.length > 0 ? 1 : 0),
      }));
    }
  }, [problems.length]);

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
        difficultyLevel: t('infoPanel.difficulty.beginner'),
      };
    }

    const operationTypes = settings.operations.length;
    const numberRange = settings.numRange[1] - settings.numRange[0];
    const averageOperands = (settings.numOperandsRange[0] + settings.numOperandsRange[1]) / 2;

    // Simple difficulty calculation
    const complexity = (numberRange * operationTypes * averageOperands) / 100;

    let difficultyLevel = t('infoPanel.difficulty.beginner');
    if (complexity > 2) {
      difficultyLevel = t('infoPanel.difficulty.intermediate');
    }
    if (complexity > 5) {
      difficultyLevel = t('infoPanel.difficulty.advanced');
    }
    if (complexity > 10) {
      difficultyLevel = t('infoPanel.difficulty.expert');
    }

    return {
      totalProblems: problems.length,
      averageComplexity: Math.round(complexity * 10) / 10,
      operationTypes,
      difficultyLevel,
    };
  };

  const stats = calculateStats();

  const tips = [
    t('infoPanel.tips.items.0'),
    t('infoPanel.tips.items.1'),
    t('infoPanel.tips.items.2'),
    t('infoPanel.tips.items.3'),
    t('infoPanel.tips.items.4'),
  ];

  // Calculate learning progress (based on problem completion)
  const learningProgress = Math.min((sessionStats.totalGenerated / 100) * 100, 100);

  const handleDownloadClick = async (): Promise<void> => {
    if (onDownloadPdf) {
      await onDownloadPdf();
    }
  };

  const handleJumpToProblems = (): void => {
    const element = document.querySelector('.problems-grid');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className='info-panel'>
      <h2>
        <span>📊</span>
        {t('infoPanel.title')}
      </h2>

      <div className='stats-grid'>
        <div
          className={STR_STAT_CARD}
          aria-label={`${t('infoPanel.stats.currentProblems')}: ${stats.totalProblems}`}
        >
          <span className={STR_STAT_VALUE}>{stats.totalProblems}</span>
          <div className={STR_STAT_LABEL}>{t('infoPanel.stats.currentProblems')}</div>
        </div>

        <div
          className={STR_STAT_CARD}
          aria-label={`${t('infoPanel.stats.totalGenerated')}: ${sessionStats.totalGenerated}`}
        >
          <span className={STR_STAT_VALUE}>{sessionStats.totalGenerated}</span>
          <div className={STR_STAT_LABEL}>{t('infoPanel.stats.totalGenerated')}</div>
        </div>

        <div
          className={STR_STAT_CARD}
          aria-label={`${t('infoPanel.stats.difficultyLevel')}: ${stats.difficultyLevel}`}
        >
          <span className={STR_STAT_VALUE}>{stats.difficultyLevel}</span>
          <div className={STR_STAT_LABEL}>{t('infoPanel.stats.difficultyLevel')}</div>
        </div>

        <div
          className={STR_STAT_CARD}
          aria-label={`${t('infoPanel.stats.operationTypes')}: ${stats.operationTypes}`}
        >
          <span className={STR_STAT_VALUE}>{stats.operationTypes}</span>
          <div className={STR_STAT_LABEL}>{t('infoPanel.stats.operationTypes')}</div>
        </div>
      </div>

      <div className='progress-section'>
        <h3>🎯 {t('infoPanel.progress.title')}</h3>
        <ProgressBar value={learningProgress} />
        <div className='progress-text'>
          {t('infoPanel.progress.completed', { percent: Math.round(learningProgress) })}
        </div>
      </div>

      <div className={STR_TIPS_SECTION}>
        <h3>⚡ {t('infoPanel.quickActions.title')}</h3>
        <div className='quick-actions-grid'>
          <button className={STR_QUICK_ACTION_CARD} onClick={onGenerateProblems}>
            <div className={STR_QUICK_ACTION_CONTENT}>
              <div className={STR_QUICK_ACTION_ICON}>🔄</div>
              <div className={STR_QUICK_ACTION_TEXT}>
                <span className={STR_QUICK_ACTION_LABEL}>
                  {t('infoPanel.quickActions.regenerate')}
                </span>
              </div>
            </div>
          </button>
          <LoadingButton
            className={STR_QUICK_ACTION_CARD}
            onClick={handleDownloadClick}
            disabled={problems.length === 0}
            loadingContent={
              <div className={STR_QUICK_ACTION_CONTENT}>
                <div className={STR_QUICK_ACTION_ICON}>📄</div>
                <div className={STR_QUICK_ACTION_TEXT}>
                  <div
                    className='loading-spinner'
                    aria-live='polite'
                    aria-label={t('messages.loading')}
                  ></div>
                </div>
              </div>
            }
          >
            <div className={STR_QUICK_ACTION_CONTENT}>
              <div className={STR_QUICK_ACTION_ICON}>📄</div>
              <div className={STR_QUICK_ACTION_TEXT}>
                <span className={STR_QUICK_ACTION_LABEL}>
                  {t('infoPanel.quickActions.downloadPdf')}
                </span>
              </div>
            </div>
          </LoadingButton>
          <button
            className={STR_QUICK_ACTION_CARD}
            onClick={onStartQuiz}
            disabled={problems.length === 0}
          >
            <div className={STR_QUICK_ACTION_CONTENT}>
              <div className={STR_QUICK_ACTION_ICON}>🎯</div>
              <div className={STR_QUICK_ACTION_TEXT}>
                <span className={STR_QUICK_ACTION_LABEL}>
                  {t('infoPanel.quickActions.startQuiz')}
                </span>
              </div>
            </div>
          </button>
          <button className={STR_QUICK_ACTION_CARD} onClick={handleJumpToProblems}>
            <div className={STR_QUICK_ACTION_CONTENT}>
              <div className={STR_QUICK_ACTION_ICON}>📝</div>
              <div className={STR_QUICK_ACTION_TEXT}>
                <span className={STR_QUICK_ACTION_LABEL}>
                  {t('infoPanel.quickActions.jumpToProblems')}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {quizResult && (
        <div className={STR_TIPS_SECTION}>
          <h3>🏆 {t('infoPanel.recentResults.title')}</h3>
          <div className='quiz-result-summary'>
            <div className={STR_RESULT_ITEM}>
              <span className={STR_RESULT_LABEL}>
                {t('infoPanel.recentResults.score', { score: quizResult.score })}
              </span>
            </div>
            <div className={STR_RESULT_ITEM}>
              <span className={STR_RESULT_LABEL}>{t('infoPanel.recentResults.grade')}</span>
              <span className='result-value'>{quizResult.grade}</span>
            </div>
            <div className={STR_RESULT_ITEM}>
              <span className={STR_RESULT_LABEL}>{t('infoPanel.recentResults.accuracy')}</span>
              <span className='result-value'>
                {Math.round((quizResult.correctAnswers / quizResult.totalProblems) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={STR_TIPS_SECTION}>
        <h3>💡 {t('infoPanel.tips.title')}</h3>
        <ul className='tips-list'>
          {tips.slice(0, 3).map(tip => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className={STR_TIPS_SECTION}>
        <h3>⚙️ {t('infoPanel.currentConfig.title')}</h3>
        <ul className='tips-list'>
          <li>
            {t('infoPanel.currentConfig.operations', {
              operations: settings.operations.join(', '),
            })}
          </li>
          <li>
            {t('infoPanel.currentConfig.numbers', {
              min: settings.numRange[0],
              max: settings.numRange[1],
            })}
          </li>
          <li>
            {t('infoPanel.currentConfig.results', {
              min: settings.resultRange[0],
              max: settings.resultRange[1],
            })}
          </li>
          <li>
            {t('infoPanel.currentConfig.operands', {
              min: settings.numOperandsRange[0],
              max: settings.numOperandsRange[1],
            })}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default InfoPanel;
