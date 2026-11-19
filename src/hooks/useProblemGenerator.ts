import type { MessageValue, Problem, Settings } from "@/types";
import { createGenerationOutcome, evaluateGeneratedProblems } from "@/domain/generation";
import { formatExpression } from "@/domain/expression";
import { calculateActualTotalProblems } from "@/utils/groupingUtils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
export { calculateExpression, generateProblem } from "@/domain/generation";
const EMPTY_MESSAGES = { error: "", warning: "", successMessage: "" } as const;
const EMPTY_PROBLEMS: Problem[] = [];
type Messages = { error: MessageValue; warning: MessageValue; successMessage: MessageValue };

export const useProblemGenerator = (
  settings: Settings,
  isLoading: boolean,
  validateSettings: (settings: Settings) => string,
  onExplicitGeneration?: (problemCount: number) => void,
) => {
  const [batch, setBatch] = useState<{ key: string; problems: Problem[] } | null>(null);
  const [messages, setMessages] = useState<Messages>(EMPTY_MESSAGES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const workerRef = useRef<Worker | null>(null);
  const generationKey = JSON.stringify([
    settings.operations,
    settings.numProblems,
    settings.numRange,
    settings.resultRange,
    settings.numOperandsRange,
    settings.allowNegative,
    settings.enableGrouping,
    settings.problemsPerGroup,
    settings.totalGroups,
  ]);
  const lastReportedToken = useRef<string | null>(null);
  const settingsAreValid = validateSettings(settings) === "";
  const current = useRef({ settings, isLoading, validateSettings, generationKey });
  current.current = { settings, isLoading, validateSettings, generationKey };
  const cancelGeneration = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setIsGenerating(false);
  }, []);
  useEffect(
    () => () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        // StrictMode remounts effects; a cancelled initial worker must be started again.
        lastReportedToken.current = null;
      }
    },
    [],
  );

  const generateProblems = useCallback(
    (showSuccessMessage = true): Messages => {
      const {
        settings: active,
        isLoading: loading,
        validateSettings: validate,
        generationKey: key,
      } = current.current;
      if (loading) return EMPTY_MESSAGES;
      const error = validate(active);
      cancelGeneration();
      if (error) {
        const outcome = { ...EMPTY_MESSAGES, error: { key: error } };
        setMessages(outcome);
        return outcome;
      }
      const acceptProblems = (problems: Problem[]): void => {
        setBatch(problems.length > 0 ? { key, problems } : null);
        if (showSuccessMessage && problems.length > 0) onExplicitGeneration?.(problems.length);
      };
      const target = calculateActualTotalProblems(active);
      if (target > 200 && typeof Worker !== "undefined") {
        let worker: Worker;
        try {
          worker = new Worker(new URL("../workers/generation.worker.ts", import.meta.url), {
            type: "module",
          });
        } catch {
          setBatch(null);
          const outcome = { ...EMPTY_MESSAGES, error: { key: "errors.generationFailed" } };
          setMessages(outcome);
          return outcome;
        }
        workerRef.current = worker;
        setIsGenerating(true);
        setProgress(0);
        worker.onmessage = (
          event: MessageEvent<{ problems?: Problem[]; progress?: number; error?: string }>,
        ) => {
          if (workerRef.current !== worker) return;
          if (current.current.generationKey !== key) {
            cancelGeneration();
            return;
          }
          if (event.data.progress !== undefined) setProgress(event.data.progress);
          if (event.data.problems) {
            acceptProblems(event.data.problems);
            setMessages(evaluateGeneratedProblems(event.data.problems, target, showSuccessMessage));
            cancelGeneration();
          } else if (event.data.error) {
            setBatch(null);
            setMessages({ ...EMPTY_MESSAGES, error: { key: event.data.error } });
            cancelGeneration();
          }
        };
        worker.onerror = () => {
          if (workerRef.current !== worker) return;
          if (current.current.generationKey === key) {
            setBatch(null);
            setMessages({ ...EMPTY_MESSAGES, error: { key: "errors.generationFailed" } });
          }
          cancelGeneration();
        };
        worker.postMessage(active);
        return EMPTY_MESSAGES;
      }
      setBatch(null);
      const outcome = createGenerationOutcome({
        settings: active,
        showSuccessMessage,
        setProblems: acceptProblems,
      });
      setMessages(outcome);
      return outcome;
    },
    [cancelGeneration, onExplicitGeneration],
  );

  useEffect(() => {
    const reportToken = `${generationKey}:${settingsAreValid}`;
    if (isLoading || reportToken === lastReportedToken.current) return;
    generateProblems(false);
    // Report each (settings key, validity) pair exactly once. Without this, a
    // concurrent render that commits with stale settings (e.g. a language swap
    // racing a transition) re-runs validation and re-raises the same error
    // after the user has already corrected the input.
    lastReportedToken.current = reportToken;
  }, [generationKey, settingsAreValid, isLoading, generateProblems]);
  const rawProblems = batch?.key === generationKey ? batch.problems : EMPTY_PROBLEMS;
  const problems = useMemo(
    () =>
      rawProblems.map((problem) => {
        if (!problem.operands || !problem.operators) return problem;
        return {
          ...problem,
          text: `${formatExpression(problem.operands, problem.operators)} = ${settings.showAnswers ? problem.correctAnswer : ""}`,
        };
      }),
    [rawProblems, settings.showAnswers],
  );
  return { problems, generateProblems, messages, isGenerating, progress, cancelGeneration };
};
