import React from 'react';

type Props = {
  t: (key: string, params?: Record<string, string | number>) => string;
  progressPercentage: number;
  current: number;
  total: number;
  timeElapsed: number;
  formatTime: (seconds: number) => string;
  onExit: () => void;
};

const QuizHeader: React.FC<Props> = ({
  t,
  progressPercentage,
  current,
  total,
  timeElapsed,
  formatTime,
  onExit,
}) => (
  <div className='quiz-header'>
    <div className='quiz-progress'>
      <div className='progress-bar'>
        <progress
          className='progress-native'
          max={100}
          value={progressPercentage}
          aria-label={t('quiz.progress', { current, total })}
        />
        <div className='progress-fill' style={{ width: `${progressPercentage}%` }}></div>
      </div>
      <span className='progress-text'>{t('quiz.progress', { current, total })}</span>
    </div>
    <div className='quiz-timer'>
      <span className='timer-icon'>⏱️</span>
      <span className='timer-text'>{formatTime(timeElapsed)}</span>
    </div>
    <button onClick={onExit} className='exit-quiz-btn-small'>
      {t('quiz.exit')}
    </button>
  </div>
);

export default QuizHeader;
