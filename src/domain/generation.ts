import type { MessageValue, Problem, Settings } from "@/types";
import { buildExpression, randomInt } from "@/utils/problemUtils";

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
  const minimum = settings.allowNegative
    ? settings.resultRange[0]
    : Math.max(0, settings.resultRange[0]);
  return Math.max(minimum, minSum) > Math.min(maxSum, settings.resultRange[1]);
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

/** Precompute feasible operand counts for reuse throughout a batch. */
export const createProblemGenerator = (settings: Settings, maxAttempts = 10000) => {
  const counts: number[] = [];
  const [min, max] = settings.numOperandsRange;
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 2 || max > 100) {
    return () => null;
  }
  for (let count = min; count <= max; count++) {
    if (!isAdditionOnlyInfeasible(settings, count)) counts.push(count);
  }
  return (): Omit<Problem, "id"> | null => {
    if (counts.length === 0) return null;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const problem = attemptGenerateProblem(settings, counts[randomInt(0, counts.length - 1)]);
      if (problem) return problem;
    }
    return null;
  };
};

export const generateStructuredProblem = (
  settings: Settings,
  maxAttempts?: number,
): Omit<Problem, "id"> | null => createProblemGenerator(settings, maxAttempts)();

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
  const nextProblem = createProblemGenerator(settings, maxAttempts);
  for (let index = 0; index < totalProblems; index++) {
    const problem = nextProblem();
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
  setProblems: (problems: Problem[]) => void;
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
