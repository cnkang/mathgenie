type Parser = { tokens: string[]; index: number };

const parseNumber = (p: Parser): number => {
  const token = p.tokens[p.index++];
  if (!token || !/^\d+(?:\.\d+)?$/.test(token)) {
    throw new Error('Expected number');
  }
  return parseFloat(token);
};

const parseFactor = (p: Parser): number => {
  if (p.tokens[p.index] === '(') {
    p.index++;
    const value = parseExpression(p);
    if (p.tokens[p.index] !== ')') {
      throw new Error('Missing closing parenthesis');
    }
    p.index++;
    return value;
  }
  return parseNumber(p);
};

const parseTerm = (p: Parser): number => {
  let result = parseFactor(p);
  while (p.index < p.tokens.length && ['*', '/'].includes(p.tokens[p.index] || '')) {
    const operator = p.tokens[p.index++];
    const factor = parseFactor(p);
    result = operator === '*' ? result * factor : result / factor;
  }
  return result;
};

const parseExpression = (p: Parser): number => {
  let result = parseTerm(p);
  while (p.index < p.tokens.length && ['+', '-'].includes(p.tokens[p.index] || '')) {
    const operator = p.tokens[p.index++];
    const term = parseTerm(p);
    result = operator === '+' ? result + term : result - term;
  }
  return result;
};

export const safeEvaluateExpression = (expression: string): number => {
  const cleanExpression = expression.replace(/\s/g, '');
  if (!/^[\d+\-*/().]+$/.test(cleanExpression)) {
    throw new Error('Invalid characters in expression');
  }
  const tokens = cleanExpression.match(/\d+(?:\.\d+)?|[+\-*/()]/g);
  if (!tokens) {
    throw new Error('Invalid expression format');
  }
  const parser: Parser = { tokens, index: 0 };
  const result = parseExpression(parser);
  if (parser.index !== tokens.length) {
    throw new Error('Unexpected tokens after expression');
  }
  return result;
};
