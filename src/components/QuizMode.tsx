import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n';
import type { Problem, QuizResult } from '../types';
import InteractiveProblem from './InteractiveProblem';

// Safe expression evaluator that only handles basic arithmetic
const safeEvaluateExpression = (expression: string): number => {
  // Remove all whitespace and validate the expression
  const cleanExpression = expression.replace(/\s/g, '');

  // Only allow numbers, basic operators, and parentheses
  if (!/^[\d+\-*/().]+$/.test(cleanExpression)) {
    throw new Error('Invalid characters in expression');
  }

  // Parse and evaluate the expression safely
  try {
    // Split into tokens
    const tokens = cleanExpression.match(/(\d+\.?\d*|[+\-*/()])/g);
    if (!tokens) throw new Error('Invalid expression format');

    // Simple recursive descent parser for basic arithmetic
    let index = 0;

    const parseNumber = (): number => {
      const token = tokens[index++];
      if (!token || !/^\d+\.?\d*$/.test(token)) {
        throw new Error('Expected number');
      }
      return parseFloat(token);
    };

    const parseExpression = (): number => {
      let result = parseTerm();

      while (index < tokens.length && (tokens[index] === '+' || tokens[index] === '-')) {
        const operator = tokens[index++];
        const term = parseTerm();
        result = operator === '+' ? result + term : result - term;
      }

      return result;
    };

    const parseTerm = (): number => {
      let result = parseFactor();

      while (index < tokens.length && (tokens[index] === '*' || tokens[index] === '/')) {
        const operator = tokens[index++];
        const factor = parseFactor();
        result = operator === '*' ? result * factor : result / factor;
      }

      return result;
    };

    const parseFactor = (): number => {
      if (tokens[index] === '(') {
        index++; // consume '('
        const result = parseExpression();
        if (tokens[index] !== ')') {
          throw new Error('Missing closing parenthesis');
        }
        index++; // consume ')'
        return result;
      }
      return parseNumber();
    };

    const result = parseExpression();

    if (index !== tokens.length) {
      throw new Error('Unexpected tokens after expression');
    }

    return result;
  } catch (error) {
    throw new Error(`Expression evaluation failed: ${error}`);
  }
};

interface QuizModeProps {
  problems: Problem[];
  onQuizComplete: (result: QuizResult) => void;
  onExitQuiz: () => void;
}

const QuizMode: React.FC<QuizModeProps> = ({ problems, onQuizComplete, onExitQuiz }) => {
  const { t } = useTranslation();
  const [quizProblems, setQuizProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    // Calculate the correct answer for each problem
    const problemsWithAnswers = problems.map(problem => {
      const expression = problem.text.replace(' = ', '').replace('✖', '*').replace('➗', '/');
      let correctAnswer: number;

      try {
        // Safely calculate the expression using a secure parser
        correctAnswer = safeEvaluateExpression(expression);
      } catch {
        console.error('Error calculating answer for:', expression);
        correctAnswer = 0;
      }

      return {
        ...problem,
        correctAnswer,
        userAnswer: undefined,
        isCorrect: false,
        isAnswered: false,
      };
    });

    setQuizProblems(problemsWithAnswers);
    setCurrentProblemIndex(0);
    setShowResults(false);
    setQuizResult(null);
    setTimeElapsed(0);
    setStartTime(Date.now());
  }, [problems]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerSubmit = (problemId: number, answer: number) => {
    setQuizProblems(prev => {
      const updatedProblems = prev.map(problem => {
        if (problem.id === problemId) {
          const isCorrect = Math.abs(answer - (problem.correctAnswer || 0)) < 0.001;
          return {
            ...problem,
            userAnswer: answer,
            isCorrect,
            isAnswered: true,
          };
        }
        return problem;
      });

      // Automatically move to the next problem
      setTimeout(() => {
        if (currentProblemIndex < updatedProblems.length - 1) {
          setCurrentProblemIndex(currentProblemIndex + 1);
        } else {
          // Completed all problems, show results
          finishQuiz(updatedProblems);
        }
      }, 1500);

      return updatedProblems;
    });
  };

  const finishQuiz = (problems?: Problem[]) => {
    const problemsToUse = problems || quizProblems;
    const correctAnswers = problemsToUse.filter(p => p.isCorrect).length;
    const totalProblems = problemsToUse.length;
    const score = Math.round((correctAnswers / totalProblems) * 100);

    let grade = t('quiz.grades.needsImprovement');
    let feedback = t('quiz.feedback.needsImprovement');

    if (score >= 90) {
      grade = t('quiz.grades.excellent');
      feedback = t('quiz.feedback.excellent');
    } else if (score >= 80) {
      grade = t('quiz.grades.good');
      feedback = t('quiz.feedback.good');
    } else if (score >= 70) {
      grade = t('quiz.grades.average');
      feedback = t('quiz.feedback.average');
    } else if (score >= 60) {
      grade = t('quiz.grades.passing');
      feedback = t('quiz.feedback.passing');
    }

    const result: QuizResult = {
      totalProblems,
      correctAnswers,
      incorrectAnswers: totalProblems - correctAnswers,
      score,
      grade,
      feedback,
    };

    setQuizResult(result);
    setShowResults(true);
    onQuizComplete(result);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goToPrevious = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(currentProblemIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentProblemIndex < quizProblems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    }
  };

  if (showResults && quizResult) {
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
            <div className='stat-item'>
              <span className='stat-icon'>📊</span>
              <span className='stat-label'>{t('quiz.stats.totalProblems')}</span>
              <span className='stat-value'>{quizResult.totalProblems}</span>
            </div>
            <div className='stat-item'>
              <span className='stat-icon'>✅</span>
              <span className='stat-label'>{t('quiz.stats.correct')}</span>
              <span className='stat-value'>{quizResult.correctAnswers}</span>
            </div>
            <div className='stat-item'>
              <span className='stat-icon'>❌</span>
              <span className='stat-label'>{t('quiz.stats.incorrect')}</span>
              <span className='stat-value'>{quizResult.incorrectAnswers}</span>
            </div>
            <div className='stat-item'>
              <span className='stat-icon'>⏱️</span>
              <span className='stat-label'>{t('quiz.stats.timeUsed')}</span>
              <span className='stat-value'>{formatTime(timeElapsed)}</span>
            </div>
          </div>

          <div className='feedback-section'>
            <p className='feedback-text'>{quizResult.feedback}</p>
          </div>

          <div className='results-actions'>
            <button onClick={onExitQuiz} className='exit-quiz-btn'>
              {t('quiz.backToPractice')}
            </button>
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentProblemIndex(0);
                setQuizProblems(prev =>
                  prev.map(p => ({
                    ...p,
                    userAnswer: undefined,
                    isCorrect: false,
                    isAnswered: false,
                  }))
                );
                setStartTime(Date.now());
              }}
              className='retry-quiz-btn'
            >
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
  }

  if (quizProblems.length === 0) {
    return <div className='quiz-loading'>{t('quiz.loading')}</div>;
  }

  const currentProblem = quizProblems[currentProblemIndex];
  const progress = ((currentProblemIndex + 1) / quizProblems.length) * 100;

  // If current problem doesn't exist, return loading state
  if (!currentProblem) {
    return <div className='quiz-loading'>{t('quiz.loading')}</div>;
  }

  return (
    <div className='quiz-mode'>
      <div className='quiz-header'>
        <div className='quiz-progress'>
          <div className='progress-bar'>
            <div className='progress-fill' style={{ width: `${progress}%` }}></div>
          </div>
          <span className='progress-text'>
            {t('quiz.progress', {
              current: currentProblemIndex + 1,
              total: quizProblems.length,
            })}
          </span>
        </div>
        <div className='quiz-timer'>
          <span className='timer-icon'>⏱️</span>
          <span className='timer-text'>{formatTime(timeElapsed)}</span>
        </div>
        <button onClick={onExitQuiz} className='exit-quiz-btn-small'>
          {t('quiz.exit')}
        </button>
      </div>

      <div className='quiz-content'>
        <div className='current-problem'>
          <h3>{t('quiz.problemNumber', { number: currentProblemIndex + 1 })}</h3>
          <InteractiveProblem
            problem={currentProblem}
            onAnswerSubmit={handleAnswerSubmit}
            showResult={currentProblem?.isAnswered || false}
          />
        </div>

        <div className='quiz-navigation'>
          <button
            onClick={goToPrevious}
            disabled={currentProblemIndex === 0}
            className='nav-btn prev-btn'
          >
            {t('quiz.previousProblem')}
          </button>
          <button
            onClick={goToNext}
            disabled={currentProblemIndex === quizProblems.length - 1}
            className='nav-btn next-btn'
          >
            {t('quiz.nextProblem')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizMode;
