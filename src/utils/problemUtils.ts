import type { Settings } from '@/types';

const getCrypto = (): Crypto => {
  return (window.crypto || (window as unknown as { msCrypto: Crypto }).msCrypto) as Crypto;
};

export const randomInt = (min: number, max: number, cryptoObj: Crypto = getCrypto()): number => {
  const array = new Uint32Array(1);
  cryptoObj.getRandomValues(array);
  const val = array[0] / (0xffffffff + 1);
  return min + Math.floor((max - min + 1) * val);
};

export const randomNonZeroInt = (
  min: number,
  max: number,
  cryptoObj: Crypto = getCrypto()
): number | null => {
  const values: number[] = [];
  for (let i = min; i <= max; i++) {
    if (i !== 0) {
      values.push(i);
    }
  }
  if (values.length === 0) {
    return null;
  }
  const idx = randomInt(0, values.length - 1, cryptoObj);
  return values[idx];
};

export const buildExpression = (
  count: number,
  settings: Settings,
  rng: typeof randomInt = randomInt,
  rngNonZero: typeof randomNonZeroInt = randomNonZeroInt
): { operands: number[]; operators: string[] } | null => {
  const operands = [rng(settings.numRange[0], settings.numRange[1])];
  const operators: string[] = [];
  for (let i = 0; i < count - 1; i++) {
    const operator = settings.operations[rng(0, settings.operations.length - 1)];
    operators.push(operator);
    const next =
      operator === '/'
        ? rngNonZero(settings.numRange[0], settings.numRange[1])
        : rng(settings.numRange[0], settings.numRange[1]);
    if (next === null) {
      return null;
    }
    operands.push(next);
  }
  return { operands, operators };
};
