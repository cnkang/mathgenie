import { describe, expect, it, vi } from "vite-plus/test";
import { safeStorage } from "./safeStorage";
describe("optional storage", () => {
  it("contains failures in every operation", () => {
    for (const method of ["getItem", "setItem", "removeItem"] as const) {
      const spy = vi.spyOn(localStorage, method).mockImplementation(() => {
        throw new Error("blocked");
      });
      if (method === "getItem") expect(safeStorage.get("settings")).toBeNull();
      if (method === "setItem") expect(safeStorage.set("settings", "{}")).toBe(false);
      if (method === "removeItem") expect(() => safeStorage.remove("settings")).not.toThrow();
      spy.mockRestore();
    }
  });
  it("stores and removes successful values", () => {
    expect(safeStorage.set("audit-settings", "{}")).toBe(true);
    expect(safeStorage.get("audit-settings")).toBe("{}");
    safeStorage.remove("audit-settings");
    expect(safeStorage.get("audit-settings")).toBeNull();
  });
});
