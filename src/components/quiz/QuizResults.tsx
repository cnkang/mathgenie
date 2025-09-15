import React from 'react';
import type { Problem, QuizResult } from '@/types';

// Do not edit manually.
const STR_STAT_ITEM = 'stat-item' as const;
const STR_STAT_ICON = 'stat-icon' as const;
const STR_STAT_LABEL = 'stat-label' as const;
const STR_STAT_VALUE = 'stat-value' as const;

type Props = {
  t: (key: string, params?: Record<string, string | number>) => string;
  quizResult: QuizResult;
  quizProblems: Problem[];
  timeElapsed: number;
  onExitQuiz: () => void;
  onRetry: () => void;
  formatTime: (seconds: number) => string;
};

const QuizResults: React.FC<Props> = ({
  t,
  quizResult,
  quizProblems,
  timeElapsed,
  onExitQuiz,
  onRetry,
  formatTime,
}) => {
  return (
    <div className='quiz-results'>
      <div className='results-header'>
        <h2>{t('quiz.completed')}</h2>
        <div className='results-summary'>
          <div className='score-display'>
            <span className='score-number'>{quizResult.score}</span>
            <span className='score-label'>{t('quiz.score')}</span>
          </div>
          <div className='grade-display'>
            <span className='grade'>{quizResult.grade}</span>
          </div>
        </div>
      </div>

      <div className='results-details'>
        <div className='result-stats'>
          <div className={STR_STAT_ITEM}>
            <span className={STR_STAT_ICON}>📊</span>
            <span className={STR_STAT_LABEL}>{t('quiz.stats.totalProblems')}</span>
            <span className={STR_STAT_VALUE}>{quizResult.totalProblems}</span>
          </div>
          <div className={STR_STAT_ITEM}>
            <span className={STR_STAT_ICON}>✅</span>
            <span className={STR_STAT_LABEL}>{t('quiz.stats.correct')}</span>
            <span className={STR_STAT_VALUE}>{quizResult.correctAnswers}</span>
          </div>
          <div className={STR_STAT_ITEM}>
            <span className={STR_STAT_ICON}>❌</span>
            <span className={STR_STAT_LABEL}>{t('quiz.stats.incorrect')}</span>
            <span className={STR_STAT_VALUE}>{quizResult.incorrectAnswers}</span>
          </div>
          <div className={STR_STAT_ITEM}>
            <span className={STR_STAT_ICON}>⏱️</span>
            <span className={STR_STAT_LABEL}>{t('quiz.stats.timeUsed')}</span>
            <span className={STR_STAT_VALUE}>{formatTime(timeElapsed)}</span>
          </div>
        </div>

        <div className='feedback-section'>
          <p className='feedback-text'>{quizResult.feedback}</p>
        </div>

        <div className='results-actions'>
          <button onClick={onExitQuiz} className='exit-quiz-btn'>
            {t('quiz.backToPractice')}
          </button>
          <button onClick={onRetry} className='retry-quiz-btn'>
            {t('quiz.retry')}
          </button>
        </div>
      </div>

      <div className='detailed-results'>
        <h3>{t('quiz.detailedResults')}</h3>
        <div className='problems-review'>
          {quizProblems.map((problem, index) => (
            <div
              key={problem.id}
              className={`problem-review ${problem.isCorrect ? 'correct' : 'incorrect'}`}
            >
              <span className='problem-number'>{index + 1}.</span>
              <span className='problem-expression'>{problem.text}</span>
              <span className='user-answer'>{problem.userAnswer}</span>
              <span className='result-icon'>{problem.isCorrect ? '✅' : '❌'}</span>
              {!problem.isCorrect && (
                <span className='correct-answer'>
                  {t('quiz.correctAnswer', { answer: problem.correctAnswer ?? 0 })}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
