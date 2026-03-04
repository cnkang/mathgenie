import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../i18n';
import type { Problem } from '../types';

interface InteractiveProblemProps {
  problem: Problem;
  onAnswerSubmit: (problemId: number, answer: number) => void;
  showResult?: boolean;
  disabled?: boolean;
}

const CorrectIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' width='18' height='18' fill='none' aria-hidden='true'>
    <path d='m5 12 4 4L19 6' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' />
  </svg>
);

const IncorrectIcon: React.FC = () => (
  <svg viewBox='0 0 24 24' width='18' height='18' fill='none' aria-hidden='true'>
    <path d='m7 7 10 10M17 7 7 17' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' />
  </svg>
);

const InteractiveProblem: React.FC<InteractiveProblemProps> = ({
  problem,
  onAnswerSubmit,
  showResult = false,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [userInput, setUserInput] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const currentProblemId = useRef<number | null>(null);

  useEffect(() => {
    // Only reset if this is a new problem
    if (currentProblemId.current !== problem.id) {
      currentProblemId.current = problem.id;

      if (problem.userAnswer !== undefined) {
        setUserInput(problem.userAnswer.toString());
        setIsSubmitted(true);
      } else {
        setUserInput('');
        setIsSubmitted(false);
      }
    }
  }, [problem.id, problem.userAnswer]);

  const handleSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();
    if (userInput.trim() === '' || isSubmitted || disabled) {
      return;
    }

    const answer = parseFloat(userInput.trim());
    if (!isNaN(answer)) {
      onAnswerSubmit(problem.id, answer);
      setIsSubmitted(true);
      setUserInput(''); // Clear input after submission
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const canShowResult = showResult && problem.isAnswered;
  let resultClass = '';
  let resultIcon: React.ReactNode = null;
  if (canShowResult) {
    if (problem.isCorrect) {
      resultClass = 'correct';
      resultIcon = <CorrectIcon />;
    } else {
      resultClass = 'incorrect';
      resultIcon = <IncorrectIcon />;
    }
  }

  return (
    <div className={`interactive-problem ${resultClass}`}>
      <div className='problem-expression'>{problem.text}</div>

      <form onSubmit={handleSubmit} className='answer-form'>
        <div className='answer-input-group'>
          <input
            type='number'
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t('quiz.enterAnswer') || 'Enter answer'}
            disabled={isSubmitted || disabled}
            className='answer-input'
            step='any'
          />
          <button
            type='submit'
            disabled={isSubmitted || disabled || userInput.trim() === ''}
            className='submit-answer-btn'
          >
            {isSubmitted ? t('quiz.submitted') || 'Submitted' : t('quiz.submit') || 'Submit'}
          </button>
        </div>
      </form>

      {canShowResult && (
        <div className='answer-result'>
          <span className='result-icon' aria-hidden='true'>
            {resultIcon}
          </span>
          <span className='result-text'>
            {problem.isCorrect ? (
              t('quiz.correct') || 'Correct!'
            ) : (
              <>
                {t('quiz.incorrect') || 'Incorrect.'}{' '}
                {t('quiz.correctAnswer', { answer: problem.correctAnswer ?? 0 }) ||
                  `The correct answer is ${problem.correctAnswer ?? 0}`}
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default InteractiveProblem;
