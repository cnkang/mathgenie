/** One arithmetic contract for generation, scoring and imported legacy text. */
export const normalizeOperator = (operator: string): string =>
  operator.replaceAll(/[✖×]/g, "*").replaceAll(/[➗÷]/g, "/");

export const calculateExpression = (operands: number[], operators: string[]): number | null => {
  if (operands.length !== operators.length + 1 || !operands.every(Number.isSafeInteger)) {
    return null;
  }
  let sum = 0;
  let term = operands[0];
  let sign = 1;
  for (const [index, raw] of operators.entries()) {
    const operator = normalizeOperator(raw);
    const next = operands[index + 1];
    if (operator === "+" || operator === "-") {
      sum += sign * term;
      sign = operator === "+" ? 1 : -1;
      term = next;
    } else if (operator === "*") {
      term *= next;
    } else if (operator === "/" && next !== 0 && term % next === 0) {
      term /= next;
    } else {
      return null;
    }
    if (!Number.isSafeInteger(sum) || !Number.isSafeInteger(term)) return null;
  }
  const answer = sum + sign * term;
  return Number.isSafeInteger(answer) ? answer : null;
};

export const formatExpression = (operands: number[], operators: string[]): string =>
  operators.reduce(
    (text, operator, index) =>
      `${text} ${operator === "*" ? "✖" : operator === "/" ? "➗" : operator} ${operands[index + 1]}`,
    String(operands[0]),
  );

type Parser = { tokens: string[]; index: number; depth: number };
const parseFactor = (parser: Parser): number => {
  if (++parser.depth > 64) throw new Error("Expression nesting is too deep");
  let value: number;
  const token = parser.tokens[parser.index++];
  if (token === "-") {
    value = -parseFactor(parser);
  } else if (token === "(") {
    value = parseExpression(parser);
    if (parser.tokens[parser.index++] !== ")") throw new Error("Missing closing parenthesis");
  } else {
    if (!token || !/^\d+(?:\.\d+)?$/.test(token)) throw new Error("Expected number");
    value = Number(token);
  }
  parser.depth--;
  return value;
};
const parseTerm = (parser: Parser): number => {
  let value = parseFactor(parser);
  while (["*", "/"].includes(parser.tokens[parser.index])) {
    const operator = parser.tokens[parser.index++];
    const next = parseFactor(parser);
    value = operator === "*" ? value * next : value / next;
  }
  return value;
};
const parseExpression = (parser: Parser): number => {
  let value = parseTerm(parser);
  while (["+", "-"].includes(parser.tokens[parser.index])) {
    const operator = parser.tokens[parser.index++];
    const next = parseTerm(parser);
    value = operator === "+" ? value + next : value - next;
  }
  return value;
};
export const safeEvaluateExpression = (expression: string): number => {
  if (expression.length > 4096) throw new Error("Expression is too long");
  const source = normalizeOperator(expression);
  if (!source.trim() || !/^[\d+\-*/().\s]+$/.test(source)) {
    throw new Error("Invalid characters in expression");
  }
  const tokens: string[] = [];
  const tokenPattern = /\s+|\d+(?:\.\d+)?|[+\-*/()]/gy;
  let offset = 0;
  while (offset < source.length) {
    tokenPattern.lastIndex = offset;
    const match = tokenPattern.exec(source);
    if (!match) throw new Error("Invalid expression format");
    if (match[0].trim()) tokens.push(match[0]);
    offset = tokenPattern.lastIndex;
  }
  const parser: Parser = { tokens, index: 0, depth: 0 };
  const result = parseExpression(parser);
  if (parser.index !== tokens.length) throw new Error("Unexpected tokens after expression");
  if (!Number.isFinite(result)) throw new Error("Expression result must be finite");
  return result;
};
