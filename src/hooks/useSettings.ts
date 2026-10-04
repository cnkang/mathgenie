import type { Settings } from "@/types";
import { defaultSettings, restoreSettings, validateSettings } from "@/domain/settings";
import { safeStorage } from "@/utils/safeStorage";
import { useEffect, useState } from "react";

const SETTINGS_STORAGE_KEY = "mathgenie-settings";
const loadSettings = (): Settings => {
  const saved = safeStorage.get(SETTINGS_STORAGE_KEY);
  if (!saved) return { ...defaultSettings };
  try {
    return restoreSettings(JSON.parse(saved));
  } catch {
    safeStorage.remove(SETTINGS_STORAGE_KEY);
    return { ...defaultSettings };
  }
};
export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  useEffect(() => {
    safeStorage.set(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);
  return { settings, setSettings, validateSettings };
};
