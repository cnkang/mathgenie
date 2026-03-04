import React, { useEffect, useRef, useState } from 'react';
import { useProgressBar } from '../hooks/useProgressBar';
import { useTranslation } from '../i18n';
import type { Problem, QuizResult, Settings } from '../types';
import './InfoPanel.css';

interface InfoPanelProps {
  problems: Problem[];
  settings: Settings;
  quizResult?: QuizResult | null;
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

const ChartIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' width='20' height='20' fill='none' aria-hidden='true'>
    <path
      d='M4 20h16M7 16V9m5 7V5m5 11v-8'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
    />
  </svg>
);

const TargetIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' width='20' height='20' fill='none' aria-hidden='true'>
    <circle cx='12' cy='12' r='8' stroke='currentColor' strokeWidth='2' />
    <circle cx='12' cy='12' r='4' stroke='currentColor' strokeWidth='2' />
    <circle cx='12' cy='12' r='1.5' fill='currentColor' />
  </svg>
);

const TrophyIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' width='20' height='20' fill='none' aria-hidden='true'>
    <path
      d='M8 4h8v2a4 4 0 0 1-8 0V4Zm-3 2h3a4 4 0 0 1-3 3V6Zm14 0h-3a4 4 0 0 0 3 3V6ZM9 20h6m-5-3h4m-2-2v2'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const InfoPanel: React.FC<InfoPanelProps> = ({ problems, settings, quizResult }) => {
  const { t } = useTranslation();
  const [sessionStats, setSessionStats] = useState({
    totalGenerated: 0,
    sessionsCount: 0,
  });
  // Track previous problems reference to avoid double-counting on remount
  const prevProblemsRef = useRef<Problem[]>([]);

  useEffect(() => {
    // Only count when problems actually change (new generation), not on remount
    if (problems.length > 0 && problems !== prevProblemsRef.current) {
      prevProblemsRef.current = problems;
      setSessionStats(prev => ({
        totalGenerated: prev.totalGenerated + problems.length,
        sessionsCount: prev.sessionsCount + 1,
      }));
    }
  }, [problems]);

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
  const learningProgress = Math.min((sessionStats.totalGenerated / 100) * 100, 100);

  return (
    <div className='info-panel'>
      <h2 className='section-title'>
        <span className='section-icon' aria-hidden='true'>
          <ChartIcon />
        </span>
        {t('infoPanel.title')}
      </h2>

      <div className='stats-grid'>
        <div
          className='stat-card'
          aria-label={`${t('infoPanel.stats.currentProblems')}: ${stats.totalProblems}`}
        >
          <span className='stat-value'>{stats.totalProblems}</span>
          <div className='stat-label'>{t('infoPanel.stats.currentProblems')}</div>
        </div>

        <div
          className='stat-card'
          aria-label={`${t('infoPanel.stats.totalGenerated')}: ${sessionStats.totalGenerated}`}
        >
          <span className='stat-value'>{sessionStats.totalGenerated}</span>
          <div className='stat-label'>{t('infoPanel.stats.totalGenerated')}</div>
        </div>

        <div
          className='stat-card'
          aria-label={`${t('infoPanel.stats.difficultyLevel')}: ${stats.difficultyLevel}`}
        >
          <span className='stat-value'>{stats.difficultyLevel}</span>
          <div className='stat-label'>{t('infoPanel.stats.difficultyLevel')}</div>
        </div>

        <div
          className='stat-card'
          aria-label={`${t('infoPanel.stats.operationTypes')}: ${stats.operationTypes}`}
        >
          <span className='stat-value'>{stats.operationTypes}</span>
          <div className='stat-label'>{t('infoPanel.stats.operationTypes')}</div>
        </div>
      </div>

      <div className='progress-section'>
        <h3 className='section-title'>
          <span className='section-icon' aria-hidden='true'>
            <TargetIcon />
          </span>
          {t('infoPanel.progress.title')}
        </h3>
        <ProgressBar value={learningProgress} />
        <div className='progress-text'>
          {t('infoPanel.progress.completed', { percent: Math.round(learningProgress) })}
        </div>
      </div>

      {quizResult && (
        <div className='tips-section'>
          <h3 className='section-title'>
            <span className='section-icon' aria-hidden='true'>
              <TrophyIcon />
            </span>
            {t('infoPanel.recentResults.title')}
          </h3>
          <div className='quiz-result-summary'>
            <div className='result-item'>
              <span className='result-label'>
                {t('infoPanel.recentResults.score', { score: quizResult.score })}
              </span>
            </div>
            <div className='result-item'>
              <span className='result-label'>{t('infoPanel.recentResults.grade')}</span>
              <span className='result-value'>{quizResult.grade}</span>
            </div>
            <div className='result-item'>
              <span className='result-label'>{t('infoPanel.recentResults.accuracy')}</span>
              <span className='result-value'>
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
