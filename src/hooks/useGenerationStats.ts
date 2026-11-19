import { safeStorage } from "@/utils/safeStorage";
import { useSyncExternalStore } from "react";

const LEGACY_KEY = "mathgenie-session-stats";
const TAB_KEY_PREFIX = "mathgenie-generated:";
const listeners = new Set<() => void>();
let tabKey: string | undefined;
let unsavedTotal = 0;

const count = (value: unknown): number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : 0;

function readLegacyTotal(): number {
  try {
    const previous: unknown = JSON.parse(safeStorage.get(LEGACY_KEY) ?? "null");
    return previous && typeof previous === "object" && "totalGenerated" in previous
      ? count(previous.totalGenerated)
      : 0;
  } catch {
    return 0;
  }
}

function readTotal(): number {
  let total = readLegacyTotal() + unsavedTotal;
  try {
    const storage = globalThis.localStorage;
    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      if (key?.startsWith(TAB_KEY_PREFIX)) total += count(Number(storage.getItem(key)));
    }
  } catch {
    // Keep in-memory credit if storage is unavailable.
  }
  return total;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent): void => {
    if (event.key === null || event.key === LEGACY_KEY || event.key.startsWith(TAB_KEY_PREFIX)) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function recordGeneratedProblems(problemCount: number): void {
  unsavedTotal += problemCount;
  // One writer per key, including when two tabs complete a worker at once.
  tabKey ??= TAB_KEY_PREFIX + crypto.getRandomValues(new Uint32Array(4)).join("-");
  const total = count(Number(safeStorage.get(tabKey))) + unsavedTotal;
  if (safeStorage.set(tabKey, String(total))) unsavedTotal = 0;
  listeners.forEach((listener) => listener());
}

export function useGeneratedTotal(): number {
  return useSyncExternalStore(subscribe, readTotal, () => 0);
}
