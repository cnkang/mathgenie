import type { MessageValue, Problem, Settings } from "@/types";
import { buildExpression, randomInt } from "@/utils/problemUtils";
import type { Dispatch, SetStateAction } from "react";

import { calculateExpression, formatExpression } from "@/domain/expression";
export { calculateExpression } from "@/domain/expression";

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
  if (settings.operations.length === 0 || !settings.operations.every((op) => op === "+")) {
    return false;
  }

  const minSum = settings.numRange[0] * numOperands;
  const maxSum = settings.numRange[1] * numOperands;
  return settings.resultRange[0] > maxSum || settings.resultRange[1] < minSum;
};

const canGenerateProblem = (settings: Settings, numOperands: number): boolean => {
  return numOperands >= 2 && !isAdditionOnlyInfeasible(settings, numOperands);
};

const createProblemText = (
  operands: number[],
  operators: string[],
  result: number,
  settings: Settings,
): string => {
  const formattedProblem = formatExpression(operands, operators);
  return settings.showAnswers ? `${formattedProblem} = ${result}` : `${formattedProblem} = `;
};

const attemptGenerateProblem = (
  settings: Settings,
  numOperands: number,
): Omit<Problem, "id"> | null => {
  const expression = buildExpression(numOperands, settings);
  if (!expression) {
    return null;
  }

  const { operands, operators } = expression;
  const result = calculateExpression(operands, operators);
  if (isResultInvalid(result, settings) || result === null) {
    return null;
  }

  return {
    text: createProblemText(operands, operators, result, settings),
    operands,
    operators,
    correctAnswer: result,
  };
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
export const generateStructuredProblem = (
  settings: Settings,
  maxAttempts = 10000,
): Omit<Problem, "id"> | null => {
  const numOperands = randomInt(settings.numOperandsRange[0], settings.numOperandsRange[1]);

  if (!canGenerateProblem(settings, numOperands)) {
    return null;
  }
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const problem = attemptGenerateProblem(settings, numOperands);
    if (problem) {
      return problem;
    }
  }

  return null;
};

export const generateProblem = (settings: Settings): string =>
  generateStructuredProblem(settings)?.text ?? "";

const getErrorMessage = (): MessageValue => ({ key: "errors.noProblemsGenerated" });

const getWarningMessage = (generated: number, requested: number): MessageValue => ({
  key: "errors.partialGeneration",
  params: { generated, requested },
});

const getSuccessMessage = (count: number): MessageValue => ({
  key: "messages.success.problemsGenerated",
  params: { count },
});

const getEmptyMessage = (): MessageValue => "";

export const evaluateGeneratedProblems = (
  generated: Problem[],
  requested: number,
  showSuccessMessage: boolean,
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

export const createProblemsArray = (settings: Settings): Problem[] => {
  // 计算实际需要生成的题目数量
  const totalProblems = settings.enableGrouping
    ? settings.problemsPerGroup * settings.totalGroups
    : settings.numProblems;

  const generated: Problem[] = [];
  // A batch-wide candidate budget bounds impossible configurations without reducing the 50k limit.
  const maxAttempts = Math.max(1, Math.min(10000, Math.floor(1000000 / totalProblems)));
  for (let index = 0; index < totalProblems; index++) {
    const problem = generateStructuredProblem(settings, maxAttempts);
    if (problem) generated.push({ ...problem, id: generated.length });
  }
  return generated;
};

const handleGenerationError = (
  err: unknown,
  warning: MessageValue,
  showSuccessMessage: boolean,
) => {
  if (import.meta.env.DEV) {
    console.error("Problem generation error:", err);
  }
  return {
    error: showSuccessMessage ? { key: "errors.generationFailed" } : "",
    warning,
    successMessage: "",
  };
};

const isLargeProblemCount = (numProblems: number): boolean => numProblems > 50;

const createLargeProblemWarning = (numProblems: number): MessageValue => ({
  key: "warnings.largeNumberOfProblems",
  params: { count: numProblems },
});

const getLargeProblemWarning = (numProblems: number): MessageValue => {
  return isLargeProblemCount(numProblems)
    ? createLargeProblemWarning(numProblems)
    : getEmptyMessage();
};

export const createGenerationOutcome = (params: {
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
