import type { QuizResult, Settings } from '@/types';

export const saveQuizResult = (result: QuizResult, settings: Settings, isDev: boolean): void => {
  try {
    const savedResults = localStorage.getItem('mathgenie-quiz-results');
    const results = savedResults ? JSON.parse(savedResults) : [];
    results.push({ ...result, timestamp: new Date().toISOString(), settings });
    if (results.length > 20) {
      results.splice(0, results.length - 20);
    }
    localStorage.setItem('mathgenie-quiz-results', JSON.stringify(results));
  } catch (error) {
    if (isDev) {
      console.warn('Failed to save quiz result:', error);
    }
  }
};
