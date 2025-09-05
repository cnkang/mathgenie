import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../i18n';
import type { Problem } from '../types';

interface InteractiveProblemProps {
  problem: Problem;
  onAnswerSubmit: (problemId: number, answer: number) => void;
  showResult?: boolean;
  disabled?: boolean;
}

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

  const handleSubmit = (e: React.FormEvent) => {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const getResultIcon = () => {
    if (!showResult || !problem.isAnswered) {
      return null;
    }
    return problem.isCorrect ? '✅' : '❌';
  };

  const getResultClass = () => {
    if (!showResult || !problem.isAnswered) {
      return '';
    }
    return problem.isCorrect ? 'correct' : 'incorrect';
  };

  return (
    <div className={`interactive-problem ${getResultClass()}`}>
      <div className='problem-expression'>{problem.text}</div>

      <form onSubmit={handleSubmit} className='answer-form'>
        <div className='answer-input-group'>
          <input
            type='number'
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
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

      {showResult && problem.isAnswered && (
        <div className='answer-result'>
          <span className='result-icon'>{getResultIcon()}</span>
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
