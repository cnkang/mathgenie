import { saveQuizResult } from './resultsStorage';

describe.sequential('resultsStorage', () => {
  const baseResult = { score: 10, total: 10, grade: 'A+' } as any;
  const baseSettings = { allowNegative: false } as any;

  beforeEach(() => {
    localStorage.clear();
  });

  test('saves result and trims to last 20 entries', () => {
    for (let i = 0; i < 25; i++) {
      saveQuizResult({ ...baseResult, score: i }, baseSettings, false);
    }
    const raw = localStorage.getItem('mathgenie-quiz-results');
    expect(raw).not.toBeNull();
    if (raw === null) {
      throw new Error('Expected quiz results in localStorage');
    }
    const arr = JSON.parse(raw);
    expect(arr.length).toBe(20);
    // Oldest trimmed, so first element should have score 5
    expect(arr[0].score).toBe(5);
  });

  test('swallows storage errors and warns in dev', () => {
    const setSpy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('boom');
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    saveQuizResult(baseResult, baseSettings, true);

    expect(warn).toHaveBeenCalled();
    setSpy.mockRestore();
    warn.mockRestore();
  });
});
