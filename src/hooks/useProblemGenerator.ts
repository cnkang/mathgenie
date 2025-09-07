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

export const useProblemGenerator = (
  settings: Settings,
  isLoading: boolean,
  validateSettings: (settings: Settings) => MessageValue
) => {
  const [problems, setProblems] = useState<Problem[]>([]);

  const generateProblems = (
    showSuccessMessage: boolean = true
  ): {
    error: MessageValue;
    warning: MessageValue;
    successMessage: MessageValue;
  } => {
    let error: MessageValue = '';
    let warning: MessageValue = '';
    let successMessage: MessageValue = '';

    if (isLoading) {
      return { error, warning, successMessage };
    }

    const validationError = validateSettings(settings);
    if (validationError) {
      return { error: validationError, warning, successMessage };
    }

    if (settings.numProblems > 50) {
      warning = {
        key: 'warnings.largeNumberOfProblems',
        params: { count: settings.numProblems },
      };
    }

    try {
      const generatedProblems = Array.from({ length: settings.numProblems }, () =>
        generateProblem(settings)
      )
        .filter(problem => problem !== '')
        .map((problem, index) => ({ id: index, text: problem }));

      if (generatedProblems.length === 0) {
        if (!isLoading && showSuccessMessage) {
          error = { key: 'errors.noProblemsGenerated' };
        }
      } else if (generatedProblems.length < settings.numProblems) {
        if (!isLoading && showSuccessMessage) {
          warning = {
            key: 'errors.partialGeneration',
            params: {
              generated: generatedProblems.length,
              requested: settings.numProblems,
            },
          };
        }
        setProblems(generatedProblems);
      } else {
        if (showSuccessMessage && !isLoading) {
          successMessage = {
            key: 'messages.success.problemsGenerated',
            params: { count: generatedProblems.length },
          };
        }
        setProblems(generatedProblems);
      }
    } catch (err) {
      if (!isLoading && showSuccessMessage) {
        error = { key: 'errors.generationFailed' };
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('Problem generation error:', err);
      }
    }

    return { error, warning, successMessage };
  };

  return {
    problems,
    generateProblems,
  };
};
