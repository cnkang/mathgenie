import { safeStorage } from "./safeStorage";
import type { QuizResult, Settings } from "@/types";

export const saveQuizResult = (result: QuizResult, settings: Settings, isDev: boolean): void => {
  try {
    const savedResults = safeStorage.get("mathgenie-quiz-results");
    const parsed: unknown = savedResults ? JSON.parse(savedResults) : [];
    const results: unknown[] = Array.isArray(parsed) ? parsed : [];
    results.push({ ...result, timestamp: new Date().toISOString(), settings });
    if (results.length > 20) {
      results.splice(0, results.length - 20);
    }
    if (!safeStorage.set("mathgenie-quiz-results", JSON.stringify(results)) && isDev)
      console.warn("Failed to save quiz result");
  } catch (error) {
    if (isDev) {
      console.warn("Failed to save quiz result:", error);
    }
  }
};
