import React from 'react';

type Props = {
  t: (key: string, params?: Record<string, string | number>) => string;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

const QuizNavigation: React.FC<Props> = ({ t, canPrev, canNext, onPrev, onNext }) => (
  <div className='quiz-navigation'>
    <button onClick={onPrev} disabled={!canPrev} className='nav-btn prev-btn'>
      {t('quiz.previousProblem')}
    </button>
    <button onClick={onNext} disabled={!canNext} className='nav-btn next-btn'>
      {t('quiz.nextProblem')}
    </button>
  </div>
);

export default QuizNavigation;
