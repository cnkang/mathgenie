import type { Operation, Settings } from "@/types";
import { normalizeOperator } from "./expression";

export const defaultSettings: Settings = {
  operations: ["+", "-"],
  numProblems: 20,
  numRange: [1, 20],
  resultRange: [0, 20],
  numOperandsRange: [2, 3],
  allowNegative: false,
  showAnswers: false,
  fontSize: 16,
  lineSpacing: 12,
  paperSize: "a4",
  enableGrouping: false,
  problemsPerGroup: 20,
  totalGroups: 1,
};
const integer = (value: unknown, min: number, max: number): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= min && value <= max;
const range = (value: unknown, min: number, max: number): value is [number, number] =>
  Array.isArray(value) &&
  value.length === 2 &&
  value.every((item) => integer(item, min, max)) &&
  value[0] <= value[1];
const operations = (value: unknown): value is Operation[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.length <= 6 &&
  value.every(
    (item) => typeof item === "string" && ["+", "-", "*", "/"].includes(normalizeOperator(item)),
  );
export const isSettingsObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const validateSettings = (value: unknown): string => {
  if (!isSettingsObject(value)) return "errors.generationFailed";
  const checks: [boolean, string][] = [
    [operations(value.operations), "errors.noOperations"],
    [integer(value.numProblems, 1, 50000), "errors.invalidProblemCount"],
    [range(value.numRange, -1000000, 1000000), "errors.invalidNumberRange"],
    [
      range(value.resultRange, -Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
      "errors.invalidResultRange",
    ],
    [range(value.numOperandsRange, 2, 100), "errors.invalidOperandsRange"],
    [
      !value.enableGrouping || integer(value.problemsPerGroup, 1, 1000),
      "errors.invalidProblemsPerGroup",
    ],
    [!value.enableGrouping || integer(value.totalGroups, 1, 100), "errors.invalidTotalGroups"],
    [
      typeof value.allowNegative === "boolean" &&
        typeof value.showAnswers === "boolean" &&
        typeof value.enableGrouping === "boolean",
      "errors.generationFailed",
    ],
    [
      integer(value.fontSize, 6, 72) &&
        integer(value.lineSpacing, 1, 144) &&
        ["a4", "letter", "legal"].includes(String(value.paperSize)),
      "errors.pdfFailed",
    ],
  ];
  const error = checks.find(([valid]) => !valid);
  if (error) return error[1];
  if (value.enableGrouping && Number(value.problemsPerGroup) * Number(value.totalGroups) > 50000) {
    return "errors.invalidTotalProblemCount";
  }
  return "";
};

/** Restore older partial storage records using only known, valid fields. */
export const restoreSettings = (value: unknown): Settings => {
  if (!isSettingsObject(value)) return { ...defaultSettings };
  const restored = { ...defaultSettings };
  for (const key of Object.keys(defaultSettings) as (keyof Settings)[]) {
    const candidate = { ...restored, [key]: value[key] };
    if (value[key] !== undefined && !validateSettings(candidate))
      Object.assign(restored, { [key]: value[key] });
  }
  restored.operations = restored.operations.map((op) => normalizeOperator(op) as Operation);
  return restored;
};

export const parseSettings = (value: unknown): Settings => {
  if (!isSettingsObject(value)) throw new Error("Invalid settings");
  const merged = {
    ...value,
    enableGrouping: value.enableGrouping ?? false,
    problemsPerGroup: value.problemsPerGroup ?? 20,
    totalGroups: value.totalGroups ?? 1,
  };
  const error = validateSettings(merged);
  if (error) throw new Error(error);
  const result = Object.fromEntries(
    Object.keys(defaultSettings).map((key) => [key, merged[key as keyof typeof merged]]),
  ) as unknown as Settings;
  result.operations = result.operations.map((op) => normalizeOperator(op) as Operation);
  return result;
};
