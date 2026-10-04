import { describe, expect, it } from "vite-plus/test";
import { calculateExpression, safeEvaluateExpression, formatExpression } from "./expression";
describe("arithmetic contract", () => {
  it.each([
    [[2, 3, 4], ["+", "*"], 14],
    [[10, 6, 2], ["-", "/"], 7],
    [[-2, 3], ["+"], 1],
    [[2, -3, 4], ["+", "*"], -10],
    [[8, 2, 3], ["÷", "×"], 12],
    [[0], [], 0],
  ])("evaluates %j with %j", (operands, operators, answer) => {
    expect(calculateExpression(operands as number[], operators as string[])).toBe(answer);
  });
  it.each([
    [[], []],
    [[1, 2], []],
    [[1.5, 2], ["+"]],
    [[Infinity], []],
    [[8, 3], ["/"]],
    [[8, 0], ["/"]],
    [[1, 2], ["?"]],
    [[Number.MAX_SAFE_INTEGER, 2], ["*"]],
    [[Number.MAX_SAFE_INTEGER, 1], ["+"]],
  ])("rejects invalid structured expression %j %j", (operands, operators) => {
    expect(calculateExpression(operands as number[], operators as string[])).toBeNull();
  });
  it.each([
    "1.+2",
    "1..2",
    "2 3",
    "2/0",
    "(2+3",
    "1".repeat(4097),
    "(".repeat(65) + "1" + ")".repeat(65),
  ])("rejects malformed or unbounded input %s", (input) =>
    expect(() => safeEvaluateExpression(input)).toThrow(),
  );
  it("supports unary minus and exact print symbols", () => {
    expect(safeEvaluateExpression("-2 + (-3) × 4")).toBe(-14);
    expect(formatExpression([2, 3, 4], ["+", "*"])).toBe("2 + 3 ✖ 4");
  });
});
