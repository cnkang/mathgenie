import { describe, expect, it } from 'vitest';
import { calculateExpression } from './useProblemGenerator';

describe.sequential('useProblemGenerator pure functions', () => {
  it('calculateExpression supports +, -, *, /', () => {
    expect(calculateExpression([1, 2], ['+'])).toBe(3);
    expect(calculateExpression([5, 3], ['-'])).toBe(2);
    expect(calculateExpression([4, 3], ['*'])).toBe(12);
    expect(calculateExpression([8, 2], ['/'])).toBe(4);
  });

  it('calculateExpression returns null for invalid division', () => {
    expect(calculateExpression([8, 3], ['/'])).toBeNull();
    expect(calculateExpression([8, 0], ['/'])).toBeNull();
  });

  it('calculateExpression returns null for unknown operator', () => {
    expect(calculateExpression([1, 1], ['?'] as any)).toBeNull();
  });

  // Intentionally not testing generateProblem here to avoid coupling with problemUtils
});
