import type { Settings } from '@/types';

const getCrypto = (): Crypto => {
  // Prefer globalThis.crypto which is available in modern browsers and Node 22+
  if (typeof globalThis !== 'undefined') {
    const maybeCrypto = (globalThis as unknown as { crypto?: Crypto }).crypto;
    if (maybeCrypto && typeof maybeCrypto.getRandomValues === 'function') {
      return maybeCrypto as Crypto;
    }
  }
  // Legacy IE fallback (unlikely used):
  const w =
    typeof window !== 'undefined' ? (window as unknown as { msCrypto?: Crypto }) : undefined;
  if (w?.msCrypto?.getRandomValues) {
    return w.msCrypto as Crypto;
  }
  throw new Error('Secure crypto.getRandomValues is not available');
};

export const randomInt = (min: number, max: number, cryptoObj: Crypto = getCrypto()): number => {
  const array = new Uint32Array(1);
  cryptoObj.getRandomValues(array);
  const val = array[0] / 0x100000000; // 2^32
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
