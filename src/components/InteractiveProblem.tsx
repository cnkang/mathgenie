import React, { useEffect, useState } from 'react';
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
  const [userInput, setUserInput] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (problem.userAnswer !== undefined) {
      setUserInput(problem.userAnswer.toString());
      setIsSubmitted(true);
    } else {
      setUserInput('');
      setIsSubmitted(false);
    }
  }, [problem.userAnswer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() === '' || isSubmitted || disabled) {
      return;
    }

    const answer = parseFloat(userInput.trim());
    if (!isNaN(answer)) {
      onAnswerSubmit(problem.id, answer);
      setIsSubmitted(true);
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
      <div className="problem-expression">{problem.text.replace(' = ', ' = ')}</div>

      <form onSubmit={handleSubmit} className="answer-form">
        <div className="answer-input-group">
          <input
            type="number"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter answer"
            disabled={isSubmitted || disabled}
            className="answer-input"
            step="any"
          />
          <button
            type="submit"
            disabled={isSubmitted || disabled || userInput.trim() === ''}
            className="submit-answer-btn"
          >
            {isSubmitted ? 'Submitted' : 'Submit'}
          </button>
        </div>
      </form>

      {showResult && problem.isAnswered && (
        <div className="answer-result">
          <span className="result-icon">{getResultIcon()}</span>
          <span className="result-text">
            {problem.isCorrect ? (
              'Correct!'
            ) : (
              <>
                Incorrect. The correct answer is <strong>{problem.correctAnswer}</strong>
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default InteractiveProblem;
