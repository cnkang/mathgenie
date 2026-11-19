import { useEffect, useRef, useState } from "react";

type NumericDraftOptions = {
  min?: number;
  max?: number;
  step?: number;
};

type NumericDraft = {
  draft: string;
  handleChange: (raw: string) => void;
  handleFocus: () => void;
  handleBlur: () => void;
  stepBy: (direction: 1 | -1) => void;
};

const clamp = (value: number, min?: number, max?: number): number => {
  let next = value;
  if (min !== undefined && next < min) next = min;
  if (max !== undefined && next > max) next = max;
  return next;
};

/**
 * Draft-state wrapper for controlled numeric inputs.
 *
 * Valid numbers commit on every change (preserving live validation and
 * auto-generation), but empty or partial input ("", "-") stays a local
 * draft instead of snapping the setting to 0. Blurring an invalid draft
 * restores the last committed value. Stepper buttons commit clamped
 * increments directly.
 */
export function useNumericDraft(
  value: number,
  onCommit: (next: number) => void,
  options: NumericDraftOptions = {},
): NumericDraft {
  const { min, max, step = 1 } = options;
  const [draft, setDraft] = useState<string>(String(value));
  const focusedRef = useRef(false);

  // Sync external updates (presets, imports) unless the user is editing.
  useEffect(() => {
    if (!focusedRef.current) {
      setDraft(String(value));
    }
  }, [value]);

  const handleChange = (raw: string): void => {
    setDraft(raw);
    const trimmed = raw.trim();
    if (trimmed === "") return;
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      onCommit(parsed);
    }
  };

  const handleFocus = (): void => {
    focusedRef.current = true;
  };

  const handleBlur = (): void => {
    focusedRef.current = false;
    const trimmed = draft.trim();
    const parsed = Number(trimmed);
    if (trimmed === "" || !Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    setDraft(String(parsed));
  };

  const stepBy = (direction: 1 | -1): void => {
    const next = clamp(value + direction * step, min, max);
    setDraft(String(next));
    if (next !== value) {
      onCommit(next);
    }
  };

  return { draft, handleChange, handleFocus, handleBlur, stepBy };
}

export default useNumericDraft;
