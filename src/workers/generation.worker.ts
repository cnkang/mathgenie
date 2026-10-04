import { generateStructuredProblem } from "@/domain/generation";
import { validateSettings } from "@/domain/settings";
import { calculateActualTotalProblems } from "@/utils/groupingUtils";
import type { Problem, Settings } from "@/types";
self.onmessage = (event: MessageEvent<Settings>) => {
  const settings = event.data;
  const error = validateSettings(settings);
  if (error) {
    self.postMessage({ error });
    return;
  }
  const total = calculateActualTotalProblems(settings);
  const maxAttempts = Math.max(1, Math.min(10000, Math.floor(1000000 / total)));
  const problems: Problem[] = [];
  try {
    for (let index = 0; index < total; index++) {
      const problem = generateStructuredProblem(settings, maxAttempts);
      if (problem) problems.push({ ...problem, id: problems.length });
      if (index % 100 === 0) self.postMessage({ progress: Math.floor((index / total) * 100) });
    }
    self.postMessage({ problems, progress: 100 });
  } catch {
    self.postMessage({ error: "errors.generationFailed" });
  }
};
