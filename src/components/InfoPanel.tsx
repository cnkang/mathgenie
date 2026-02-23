import React, { useEffect, useRef, useState } from 'react';
import { useProgressBar } from '../hooks/useProgressBar';
import { useTranslation } from '../i18n';
import type { Problem, QuizResult, Settings } from '../types';

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
      <h2>
        <span>📊</span>
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
        <h3>🎯 {t('infoPanel.progress.title')}</h3>
        <ProgressBar value={learningProgress} />
        <div className='progress-text'>
          {t('infoPanel.progress.completed', { percent: Math.round(learningProgress) })}
        </div>
      </div>

      {quizResult && (
        <div className='tips-section'>
          <h3>🏆 {t('infoPanel.recentResults.title')}</h3>
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
