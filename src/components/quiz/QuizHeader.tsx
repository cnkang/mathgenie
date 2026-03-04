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

const TimerIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' width='18' height='18' fill='none' aria-hidden='true'>
    <circle cx='12' cy='13' r='8' stroke='currentColor' strokeWidth='2' />
    <path d='M12 9v4l3 2M9 3h6' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
  </svg>
);

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
      <span className='timer-icon' aria-hidden='true'>
        <TimerIcon />
      </span>
      <span className='timer-text'>{formatTime(timeElapsed)}</span>
    </div>
    <button onClick={onExit} className='exit-quiz-btn-small'>
      {t('quiz.exit')}
    </button>
  </div>
);

export default QuizHeader;
