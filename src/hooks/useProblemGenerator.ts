import { useState } from 'react';
import type { MessageValue, Problem, Settings } from '@/types';

export const calculateExpression = (operands: number[], operators: string[]): number | null => {
  let result = operands[0];

  for (let i = 0; i < operators.length; i++) {
    const operator = operators[i];
    const operand = operands[i + 1];

    switch (operator) {
      case '+':
        result += operand;
        break;
      case '-':
        result -= operand;
        break;
      case '*':
        result *= operand;
        break;
      case '/':
        if (operand === 0 || result % operand !== 0) {
          return null;
        }
        result = result / operand;
        break;
      default:
        return null;
    }
  }

  return result;
};

export const generateProblem = (settings: Settings): string => {
  const cryptoObj = window.crypto || (window as any).msCrypto;
  const random = (min: number, max: number): number => {
    const array = new Uint32Array(1);
    cryptoObj.getRandomValues(array);
    const val = array[0] / (0xffffffff + 1);
    return min + Math.floor((max - min + 1) * val);
  };

  const randomNonZero = (min: number, max: number): number | null => {
    const values: number[] = [];
    for (let i = min; i <= max; i++) {
      if (i !== 0) {
        values.push(i);
      }
    }
    if (values.length === 0) {
      return null;
    }
    const idx = random(0, values.length - 1);
    return values[idx];
  };

  const buildExpression = (count: number): { operands: number[]; operators: string[] } | null => {
    const operands = [random(settings.numRange[0], settings.numRange[1])];
    const operators: string[] = [];
    for (let i = 0; i < count - 1; i++) {
      const operator = settings.operations[random(0, settings.operations.length - 1)];
      operators.push(operator);
      const next =
        operator === '/'
          ? randomNonZero(settings.numRange[0], settings.numRange[1])
          : random(settings.numRange[0], settings.numRange[1]);
      if (next === null) {
        return null;
      }
      operands.push(next);
    }
    return { operands, operators };
  };

  const numOperands = random(settings.numOperandsRange[0], settings.numOperandsRange[1]);
  if (numOperands < 2) {
    return '';
  }

  const MAX_ATTEMPTS = 10000;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const expression = buildExpression(numOperands);
    if (!expression) {
      return '';
    }
    const { operands, operators } = expression;

    const result = calculateExpression(operands, operators);
    const invalid =
      result === null ||
      result < settings.resultRange[0] ||
      result > settings.resultRange[1] ||
      (!settings.allowNegative && result < 0);

    if (invalid) {
      continue;
    }

    let problem = operands[0].toString();
    operators.forEach((operator, index) => {
      problem += ` ${operator} ${operands[index + 1]}`;
    });

    problem = problem.replace(/\*/g, '✖').replace(/\//g, '➗');

    return settings.showAnswers ? `${problem} = ${result}` : `${problem} = `;
  }

  return '';
};

export const useProblemGenerator = (
  settings: Settings,
  isLoading: boolean,
  validateSettings: (settings: Settings) => MessageValue
) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [error, setError] = useState<MessageValue>('');
  const [warning, setWarning] = useState<MessageValue>('');
  const [successMessage, setSuccessMessage] = useState<MessageValue>('');

  const generateProblems = (showSuccessMessage: boolean = true): void => {
    setError('');
    setWarning('');
    setSuccessMessage('');

    if (isLoading) {
      return;
    }

    const validationError = validateSettings(settings);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (settings.numProblems > 50) {
      setWarning({
        key: 'warnings.largeNumberOfProblems',
        params: { count: settings.numProblems },
      });
    }

    try {
      const generatedProblems = Array.from({ length: settings.numProblems }, () =>
        generateProblem(settings)
      )
        .filter(problem => problem !== '')
        .map((problem, index) => ({ id: index, text: problem }));

      if (generatedProblems.length === 0) {
        if (!isLoading && showSuccessMessage) {
          setError({ key: 'errors.noProblemsGenerated' });
        }
      } else if (generatedProblems.length < settings.numProblems) {
        if (!isLoading && showSuccessMessage) {
          setWarning({
            key: 'errors.partialGeneration',
            params: {
              generated: generatedProblems.length,
              requested: settings.numProblems,
            },
          });
        }
        setProblems(generatedProblems);
      } else {
        if (showSuccessMessage && !isLoading) {
          setSuccessMessage({
            key: 'messages.success.problemsGenerated',
            params: { count: generatedProblems.length },
          });
          setTimeout(() => setSuccessMessage(''), 5000);
        }
        setProblems(generatedProblems);
      }
    } catch (err) {
      if (!isLoading && showSuccessMessage) {
        setError({ key: 'errors.generationFailed' });
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('Problem generation error:', err);
      }
    }
  };

  return {
    problems,
    error,
    warning,
    successMessage,
    generateProblems,
    setError,
    setWarning,
    setSuccessMessage,
  };
};
