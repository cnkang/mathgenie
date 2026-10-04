import { normalizeOperator } from "@/domain/expression";
import type { Settings } from "@/types";

const getCrypto = (): Crypto => {
  // Prefer globalThis.crypto which is available in modern browsers and Node 22+
  if (typeof globalThis !== "undefined") {
    const maybeCrypto = (globalThis as typeof globalThis & { crypto?: Crypto }).crypto;
    if (typeof maybeCrypto?.getRandomValues === "function") {
      return maybeCrypto;
    }
  }
  // Legacy IE fallback (unlikely used):
  const w = globalThis as typeof globalThis & { msCrypto?: Crypto };
  if (typeof w.msCrypto?.getRandomValues === "function") {
    return w.msCrypto;
  }
  throw new Error("Secure crypto.getRandomValues is not available");
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
  cryptoObj: Crypto = getCrypto(),
): number | null => {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min > max) return null;
  const crossesZero = min <= 0 && max >= 0;
  const count = max - min + 1 - (crossesZero ? 1 : 0);
  if (count === 0) return null;
  const value = min + randomInt(0, count - 1, cryptoObj);
  return crossesZero && value >= 0 ? value + 1 : value;
};

export const buildExpression = (
  count: number,
  settings: Settings,
  rng: typeof randomInt = randomInt,
  rngNonZero: typeof randomNonZeroInt = randomNonZeroInt,
): { operands: number[]; operators: string[] } | null => {
  const operands = [rng(settings.numRange[0], settings.numRange[1])];
  const operators: string[] = [];
  for (let i = 0; i < count - 1; i++) {
    const operator = normalizeOperator(settings.operations[rng(0, settings.operations.length - 1)]);
    operators.push(operator);
    const next =
      operator === "/"
        ? rngNonZero(settings.numRange[0], settings.numRange[1])
        : rng(settings.numRange[0], settings.numRange[1]);
    if (next === null) {
      return null;
    }
    operands.push(next);
  }
  return { operands, operators };
};
