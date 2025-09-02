import { describe, it, expect, vi } from "vitest";

// Mock crypto for testing
const mockCrypto = {
  getRandomValues: vi.fn((arr: Uint32Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 0xffffffff);
    }
    return arr;
  }),
};

Object.defineProperty(global, "crypto", {
  value: mockCrypto,
  writable: true,
});

// Math generation utilities
export const calculateExpression = (operands: number[], operators: string[]): number => {
  let result = operands[0];

  for (let i = 0; i < operators.length; i++) {
    const operator = operators[i];
    const operand = operands[i + 1];

    switch (operator) {
      case "+":
        result += operand;
        break;
      case "-":
        result -= operand;
        break;
      case "*":
        result *= operand;
        break;
      case "/":
        result = result / operand;
        break;
      default:
        return NaN;
    }
  }

  return result;
};

export const generateRandomNumber = (min: number, max: number): number => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const val = array[0] / (0xffffffff + 1);
  return min + Math.floor((max - min + 1) * val);
};

describe("Math Generation Utils", () => {
  describe("calculateExpression", () => {
    it("calculates addition correctly", () => {
      expect(calculateExpression([5, 3], ["+"])).toBe(8);
    });

    it("calculates subtraction correctly", () => {
      expect(calculateExpression([10, 4], ["-"])).toBe(6);
    });

    it("calculates multiplication correctly", () => {
      expect(calculateExpression([6, 7], ["*"])).toBe(42);
    });

    it("calculates division correctly", () => {
      expect(calculateExpression([15, 3], ["/"])).toBe(5);
    });

    it("handles multiple operations", () => {
      expect(calculateExpression([10, 5, 2], ["+", "*"])).toBe(30);
    });

    it("returns NaN for invalid operators", () => {
      expect(calculateExpression([5, 3], ["%"])).toBeNaN();
    });
  });

  describe("generateRandomNumber", () => {
    it("generates numbers within range", () => {
      const result = generateRandomNumber(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
    });

    it("handles single number range", () => {
      const result = generateRandomNumber(5, 5);
      expect(result).toBe(5);
    });
  });
});
