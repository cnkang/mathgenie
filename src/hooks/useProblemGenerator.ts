import { useState } from 'react';
import { buildExpression, randomInt } from '@/utils/problemUtils';
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
  const numOperands = randomInt(settings.numOperandsRange[0], settings.numOperandsRange[1]);
  if (numOperands < 2) {
    return '';
  }

  const MAX_ATTEMPTS = 10000;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const expression = buildExpression(numOperands, settings);
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

const evaluateGeneratedProblems = (
  generated: Problem[],
  requested: number,
  showSuccessMessage: boolean
): {
  error: MessageValue;
  warning: MessageValue;
  successMessage: MessageValue;
} => {
  if (generated.length === 0) {
    return {
      error: showSuccessMessage ? { key: 'errors.noProblemsGenerated' } : '',
      warning: '',
      successMessage: '',
    };
  }

  if (generated.length < requested) {
    return {
      error: '',
      warning: showSuccessMessage
        ? {
            key: 'errors.partialGeneration',
            params: { generated: generated.length, requested },
          }
        : '',
      successMessage: '',
    };
  }

  return {
    error: '',
    warning: '',
    successMessage: showSuccessMessage
      ? {
          key: 'messages.success.problemsGenerated',
          params: { count: generated.length },
        }
      : '',
  };
};

export const useProblemGenerator = (
  settings: Settings,
  isLoading: boolean,
  validateSettings: (settings: Settings) => string
) => {
  const [problems, setProblems] = useState<Problem[]>([]);

  const generateProblems = (
    showSuccessMessage: boolean = true
  ): {
    error: MessageValue;
    warning: MessageValue;
    successMessage: MessageValue;
  } => {
    if (isLoading) {
      return { error: '', warning: '', successMessage: '' };
    }

    const validationError = validateSettings(settings);
    if (validationError) {
      return {
        error: typeof validationError === 'string' ? { key: validationError } : validationError,
        warning: '',
        successMessage: '',
      };
    }

    const warning: MessageValue =
      settings.numProblems > 50
        ? { key: 'warnings.largeNumberOfProblems', params: { count: settings.numProblems } }
        : '';

    try {
      const generatedProblems = Array.from({ length: settings.numProblems }, () =>
        generateProblem(settings)
      )
        .filter(problem => problem !== '')
        .map((problem, index) => ({ id: index, text: problem }));

      const messages = evaluateGeneratedProblems(
        generatedProblems,
        settings.numProblems,
        showSuccessMessage
      );

      if (generatedProblems.length > 0) {
        setProblems(generatedProblems);
      }

      return { ...messages, warning: messages.warning || warning };
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Problem generation error:', err);
      }
      return {
        error: showSuccessMessage ? { key: 'errors.generationFailed' } : '',
        warning,
        successMessage: '',
      };
    }
  };

  return {
    problems,
    generateProblems,
  };
};
