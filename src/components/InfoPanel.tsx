import React, { useEffect, useState } from 'react';
import { useProgressBar } from '../hooks/useProgressBar';
import { useTranslation } from '../i18n';
import type { Problem, QuizResult, Settings } from '../types';

interface InfoPanelProps {
  problems: Problem[];
  settings: Settings;
  onGenerateProblems?: () => void;
  onDownloadPdf?: () => void;
  quizResult?: QuizResult | null;
  onStartQuiz?: () => void;
}

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

  // Calculate statistics
  const calculateStats = () => {
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

  const ProgressBar: React.FC<{ value: number }> = ({ value }) => {
    const { progressBarProps, progressFillProps } = useProgressBar({ value });
    return (
      <div {...progressBarProps}>
        <div {...progressFillProps}></div>
      </div>
    );
  };

  return (
    <div className='info-panel'>
      <h3>
        <span>📊</span>
        {t('infoPanel.title')}
      </h3>

      <div className='stats-grid'>
        <div
          className='stat-card'
          tabIndex={0}
          role='button'
          aria-label={`${t('infoPanel.stats.currentProblems')}: ${stats.totalProblems}`}
        >
          <span className='stat-value'>{stats.totalProblems}</span>
          <div className='stat-label'>{t('infoPanel.stats.currentProblems')}</div>
        </div>

        <div
          className='stat-card'
          tabIndex={0}
          role='button'
          aria-label={`${t('infoPanel.stats.totalGenerated')}: ${sessionStats.totalGenerated}`}
        >
          <span className='stat-value'>{sessionStats.totalGenerated}</span>
          <div className='stat-label'>{t('infoPanel.stats.totalGenerated')}</div>
        </div>

        <div
          className='stat-card'
          tabIndex={0}
          role='button'
          aria-label={`${t('infoPanel.stats.difficultyLevel')}: ${stats.difficultyLevel}`}
        >
          <span className='stat-value'>{stats.difficultyLevel}</span>
          <div className='stat-label'>{t('infoPanel.stats.difficultyLevel')}</div>
        </div>

        <div
          className='stat-card'
          tabIndex={0}
          role='button'
          aria-label={`${t('infoPanel.stats.operationTypes')}: ${stats.operationTypes}`}
        >
          <span className='stat-value'>{stats.operationTypes}</span>
          <div className='stat-label'>{t('infoPanel.stats.operationTypes')}</div>
        </div>
      </div>

      <div className='progress-section'>
        <h4>🎯 {t('infoPanel.progress.title')}</h4>
        <ProgressBar value={learningProgress} />
        <div className='progress-text'>
          {t('infoPanel.progress.completed', { percent: Math.round(learningProgress) })}
        </div>
      </div>

      <div className='tips-section'>
        <h4>⚡ {t('infoPanel.quickActions.title')}</h4>
        <div className='quick-actions-grid'>
          <button className='quick-action-card' onClick={onGenerateProblems}>
            <div className='quick-action-content'>
              <div className='quick-action-icon'>🔄</div>
              <div className='quick-action-text'>
                <span className='quick-action-label'>{t('infoPanel.quickActions.regenerate')}</span>
              </div>
            </div>
          </button>
          <button
            className='quick-action-card'
            onClick={onDownloadPdf}
            disabled={problems.length === 0}
          >
            <div className='quick-action-content'>
              <div className='quick-action-icon'>📄</div>
              <div className='quick-action-text'>
                <span className='quick-action-label'>
                  {t('infoPanel.quickActions.downloadPdf')}
                </span>
              </div>
            </div>
          </button>
          <button
            className='quick-action-card'
            onClick={onStartQuiz}
            disabled={problems.length === 0}
          >
            <div className='quick-action-content'>
              <div className='quick-action-icon'>🎯</div>
              <div className='quick-action-text'>
                <span className='quick-action-label'>{t('infoPanel.quickActions.startQuiz')}</span>
              </div>
            </div>
          </button>
          <button
            className='quick-action-card'
            onClick={() => {
              const element = document.querySelector('.problems-grid');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <div className='quick-action-content'>
              <div className='quick-action-icon'>📝</div>
              <div className='quick-action-text'>
                <span className='quick-action-label'>
                  {t('infoPanel.quickActions.jumpToProblems')}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {quizResult && (
        <div className='tips-section'>
          <h4>🏆 {t('infoPanel.recentResults.title')}</h4>
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

      <div className='tips-section'>
        <h4>💡 {t('infoPanel.tips.title')}</h4>
        <ul className='tips-list'>
          {tips.slice(0, 3).map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className='tips-section'>
        <h4>⚙️ {t('infoPanel.currentConfig.title')}</h4>
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
