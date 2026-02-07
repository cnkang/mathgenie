import type { MessageValue, Problem, Settings } from '@/types';
import { buildExpression, randomInt } from '@/utils/problemUtils';
import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

const applyOperation = (result: number, operator: string, operand: number): number | null => {
  const operations: Record<string, (a: number, b: number) => number | null> = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => (b === 0 || a % b !== 0 ? null : a / b),
  };

  const operation = operations[operator];
  return operation ? operation(result, operand) : null;
};

/**
 * Calculates the result of a mathematical expression with given operands and operators
 *
 * @param operands - Array of numbers to operate on
 * @param operators - Array of operators (+, -, *, /) to apply between operands
 * @returns The calculated result or null if the operation is invalid (e.g., division by zero)
 *
 * @example
 * ```typescript
 * calculateExpression([5, 3], ['+']) // Returns 8
 * calculateExpression([10, 2], ['/']) // Returns 5
 * calculateExpression([10, 0], ['/']) // Returns null (division by zero)
 * ```
 */
export const calculateExpression = (operands: number[], operators: string[]): number | null => {
  let result = operands[0];

  for (let i = 0; i < operators.length; i++) {
    const newResult = applyOperation(result, operators[i], operands[i + 1]);
    if (newResult === null) {
      return null;
    }
    result = newResult;
  }

  return result;
};

const isResultNull = (result: number | null): result is null => result === null;

const isResultOutOfRange = (result: number, settings: Settings): boolean => {
  const [minResult, maxResult] = settings.resultRange;
  return result < minResult || result > maxResult;
};

const isResultNegativeWhenNotAllowed = (result: number, settings: Settings): boolean => {
  return !settings.allowNegative && result < 0;
};

const isResultInvalid = (result: number | null, settings: Settings): boolean => {
  if (isResultNull(result)) {
    return true;
  }

  return isResultOutOfRange(result, settings) || isResultNegativeWhenNotAllowed(result, settings);
};

const isAdditionOnlyInfeasible = (settings: Settings, numOperands: number): boolean => {
  if (settings.operations.length === 0 || !settings.operations.every(op => op === '+')) {
    return false;
  }

  const minSum = settings.numRange[0] * numOperands;
  const maxSum = settings.numRange[1] * numOperands;
  return settings.resultRange[0] > maxSum || settings.resultRange[1] < minSum;
};

const formatProblemExpression = (operands: number[], operators: string[]): string => {
  return operators
    .reduce((expression, operator, index) => {
      return `${expression} ${operator} ${operands[index + 1]}`;
    }, operands[0].toString())
    .replace(/\*/g, '✖')
    .replace(/\//g, '➗');
};

const canGenerateProblem = (settings: Settings, numOperands: number): boolean => {
  return numOperands >= 2 && !isAdditionOnlyInfeasible(settings, numOperands);
};

const createProblemText = (
  operands: number[],
  operators: string[],
  result: number,
  settings: Settings
): string => {
  const formattedProblem = formatProblemExpression(operands, operators);
  return settings.showAnswers ? `${formattedProblem} = ${result}` : `${formattedProblem} = `;
};

const attemptGenerateProblem = (settings: Settings, numOperands: number): string | null => {
  const expression = buildExpression(numOperands, settings);
  if (!expression) {
    return null;
  }

  const { operands, operators } = expression;
  const result = calculateExpression(operands, operators);
  if (isResultInvalid(result, settings) || result === null) {
    return null;
  }

  return createProblemText(operands, operators, result, settings);
};

/**
 * Generates a single math problem based on the provided settings
 *
 * @param settings - Configuration object containing operation types, ranges, and display options
 * @returns A formatted math problem string, or empty string if generation fails
 *
 * @example
 * ```typescript
 * const settings = {
 *   operations: ['+', '-'],
 *   numRange: [1, 10],
 *   resultRange: [0, 20],
 *   numOperandsRange: [2, 3],
 *   allowNegative: false,
 *   showAnswers: true,
 *   // ... other settings
 * };
 *
 * generateProblem(settings) // Returns "5 + 3 = 8" or similar
 * ```
 */
export const generateProblem = (settings: Settings): string => {
  const numOperands = randomInt(settings.numOperandsRange[0], settings.numOperandsRange[1]);

  if (!canGenerateProblem(settings, numOperands)) {
    return '';
  }

  const MAX_ATTEMPTS = 10000;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const problem = attemptGenerateProblem(settings, numOperands);
    if (problem) {
      return problem;
    }
  }

  return '';
};

const getErrorMessage = (): MessageValue => ({ key: 'errors.noProblemsGenerated' });

const getWarningMessage = (generated: number, requested: number): MessageValue => ({
  key: 'errors.partialGeneration',
  params: { generated, requested },
});

const getSuccessMessage = (count: number): MessageValue => ({
  key: 'messages.success.problemsGenerated',
  params: { count },
});

const getEmptyMessage = (): MessageValue => '';

const evaluateGeneratedProblems = (
  generated: Problem[],
  requested: number,
  showSuccessMessage: boolean
): {
  error: MessageValue;
  warning: MessageValue;
  successMessage: MessageValue;
} => {
  const generatedCount = generated.length;

  if (generatedCount === 0) {
    return {
      error: showSuccessMessage ? getErrorMessage() : getEmptyMessage(),
      warning: getEmptyMessage(),
      successMessage: getEmptyMessage(),
    };
  }

  if (generatedCount < requested) {
    return {
      error: getEmptyMessage(),
      warning: showSuccessMessage
        ? getWarningMessage(generatedCount, requested)
        : getEmptyMessage(),
      successMessage: getEmptyMessage(),
    };
  }

  return {
    error: getEmptyMessage(),
    warning: getEmptyMessage(),
    successMessage: showSuccessMessage ? getSuccessMessage(generatedCount) : getEmptyMessage(),
  };
};

const createProblemsArray = (settings: Settings): Problem[] => {
  // 计算实际需要生成的题目数量
  const totalProblems = settings.enableGrouping
    ? settings.problemsPerGroup * settings.totalGroups
    : settings.numProblems;

  return Array.from({ length: totalProblems }, () => generateProblem(settings))
    .filter(problem => problem !== '')
    .map((problem, index) => ({ id: index, text: problem }));
};

const handleGenerationError = (
  err: unknown,
  warning: MessageValue,
  showSuccessMessage: boolean
) => {
  if (import.meta.env.DEV) {
    console.error('Problem generation error:', err);
  }
  return {
    error: showSuccessMessage ? { key: 'errors.generationFailed' } : '',
    warning,
    successMessage: '',
  };
};

const processValidationError = (validationError: string) => ({
  error: { key: validationError },
  warning: getEmptyMessage(),
  successMessage: getEmptyMessage(),
});

const EMPTY_MESSAGES = { error: '', warning: '', successMessage: '' } as const;

const isLargeProblemCount = (numProblems: number): boolean => numProblems > 50;

const createLargeProblemWarning = (numProblems: number): MessageValue => ({
  key: 'warnings.largeNumberOfProblems',
  params: { count: numProblems },
});

const getLargeProblemWarning = (numProblems: number): MessageValue => {
  return isLargeProblemCount(numProblems)
    ? createLargeProblemWarning(numProblems)
    : getEmptyMessage();
};

const createGenerationOutcome = (params: {
  settings: Settings;
  showSuccessMessage: boolean;
  setProblems: Dispatch<SetStateAction<Problem[]>>;
}) => {
  const { settings, showSuccessMessage, setProblems } = params;
  const targetCount = settings.enableGrouping
    ? settings.problemsPerGroup * settings.totalGroups
    : settings.numProblems;
  const fallbackWarning = getLargeProblemWarning(targetCount);

  try {
    const generatedProblems = createProblemsArray(settings);
    const messages = evaluateGeneratedProblems(generatedProblems, targetCount, showSuccessMessage);

    if (generatedProblems.length > 0) {
      setProblems(generatedProblems);
    }

    return { ...messages, warning: messages.warning || fallbackWarning };
  } catch (err) {
    return handleGenerationError(err, fallbackWarning, showSuccessMessage);
  }
};

/**
 * Hook for generating math problems based on settings
 *
 * @param settings - The settings configuration for problem generation
 * @param isLoading - Whether the app is in a loading state (prevents generation)
 * @param validateSettings - Function to validate settings before generation
 * @returns Object containing problems array and generateProblems function
 *
 * @example
 * ```typescript
 * const { problems, generateProblems } = useProblemGenerator(
 *   settings,
 *   isLoading,
 *   validateSettings
 * );
 *
 * // Generate problems with success message
 * const result = generateProblems(true);
 *
 * // Generate problems without success message (for auto-regeneration)
 * const result = generateProblems(false);
 * ```
 */
const handleValidationError = (validationError: string) => processValidationError(validationError);

const handleSuccessfulGeneration = (
  settings: Settings,
  showSuccessMessage: boolean,
  setProblems: Dispatch<SetStateAction<Problem[]>>
) => createGenerationOutcome({ settings, showSuccessMessage, setProblems });

const processGenerationLogic = (
  settings: Settings,
  showSuccessMessage: boolean,
  setProblems: Dispatch<SetStateAction<Problem[]>>,
  validateSettings: (settings: Settings) => string
) => {
  const validationError = validateSettings(settings);
  return validationError
    ? handleValidationError(validationError)
    : handleSuccessfulGeneration(settings, showSuccessMessage, setProblems);
};

export const useProblemGenerator = (
  settings: Settings,
  isLoading: boolean,
  validateSettings: (settings: Settings) => string
) => {
  const [problems, setProblems] = useState<Problem[]>([]);

  const processGeneration = useCallback(
    (showSuccessMessage: boolean) =>
      processGenerationLogic(settings, showSuccessMessage, setProblems, validateSettings),
    [settings, validateSettings, setProblems]
  );

  const generateProblems = useCallback(
    (showSuccessMessage: boolean = true) =>
      isLoading ? { ...EMPTY_MESSAGES } : processGeneration(showSuccessMessage),
    [isLoading, processGeneration]
  );

  // Auto-regenerate problems when settings change (no success toast)
  useEffect(() => {
    if (!isLoading) {
      generateProblems(false);
    }
    // We intentionally exclude generateProblems from deps to avoid recreation loop
  }, [settings, isLoading, validateSettings]);

  return {
    problems,
    generateProblems,
  };
};
