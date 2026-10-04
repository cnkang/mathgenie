import { describe, expect, it } from "vite-plus/test";
import { defaultSettings, parseSettings, restoreSettings, validateSettings } from "./settings";
describe("settings boundaries", () => {
  it.each([
    null,
    [],
    "settings",
    {},
    { ...defaultSettings, numProblems: NaN },
    { ...defaultSettings, numProblems: 1.5 },
    { ...defaultSettings, numProblems: 50001 },
    { ...defaultSettings, numRange: ["1", 2] },
    { ...defaultSettings, resultRange: [5, 2] },
    { ...defaultSettings, numOperandsRange: [2, 101] },
    { ...defaultSettings, operations: ["?"] },
    { ...defaultSettings, operations: [] },
    { ...defaultSettings, allowNegative: "yes" },
    { ...defaultSettings, fontSize: 0 },
    { ...defaultSettings, lineSpacing: Infinity },
    { ...defaultSettings, paperSize: "poster" },
    { ...defaultSettings, problemsPerGroup: 0 },
    { ...defaultSettings, totalGroups: 101 },
    { ...defaultSettings, enableGrouping: true, problemsPerGroup: 1000, totalGroups: 51 },
  ])("rejects invalid setting %j", (value) => {
    expect(validateSettings(value)).not.toBe("");
    expect(() => parseSettings(value)).toThrow();
  });
  it("normalizes legacy symbols and migrates missing grouping fields", () => {
    const {
      enableGrouping: _enabled,
      totalGroups: _groups,
      problemsPerGroup: _count,
      ...old
    } = defaultSettings;
    expect(parseSettings({ ...old, operations: ["×", "÷"] })).toMatchObject({
      operations: ["*", "/"],
      enableGrouping: false,
      totalGroups: 1,
    });
  });
  it("restores only valid fields and ignores unknown keys", () => {
    expect(
      restoreSettings({ numProblems: 10, numRange: [1], operations: ["invalid"], injected: true }),
    ).toEqual({ ...defaultSettings, numProblems: 10 });
    expect(restoreSettings(null)).toEqual(defaultSettings);
    expect(validateSettings(defaultSettings)).toBe("");
  });
  it("keeps the full supported capacity", () => {
    expect(parseSettings({ ...defaultSettings, numProblems: 50000 }).numProblems).toBe(50000);
  });
});
