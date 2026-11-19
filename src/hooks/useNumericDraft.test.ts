import { act, renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { useNumericDraft } from "./useNumericDraft";

describe("useNumericDraft", () => {
  it("commits valid numbers on change", () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useNumericDraft(5, onCommit));
    act(() => result.current.handleChange("12"));
    expect(onCommit).toHaveBeenCalledWith(12);
    expect(result.current.draft).toBe("12");
  });

  it("keeps empty and partial drafts without committing", () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useNumericDraft(5, onCommit));
    act(() => result.current.handleChange(""));
    act(() => result.current.handleChange("-"));
    expect(onCommit).not.toHaveBeenCalled();
    expect(result.current.draft).toBe("-");
  });

  it("restores the committed value when blurring an invalid draft", () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useNumericDraft(5, onCommit));
    act(() => result.current.handleFocus());
    act(() => result.current.handleChange(""));
    act(() => result.current.handleBlur());
    expect(result.current.draft).toBe("5");
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("normalizes a valid draft on blur", () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useNumericDraft(5, onCommit));
    act(() => result.current.handleFocus());
    act(() => result.current.handleChange("007"));
    act(() => result.current.handleBlur());
    expect(result.current.draft).toBe("7");
  });

  it("commits the retained draft on blur after an external value change", () => {
    const onCommit = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useNumericDraft(value, onCommit), {
      initialProps: { value: 5 },
    });
    act(() => result.current.handleFocus());
    act(() => result.current.handleChange("12"));
    onCommit.mockClear();
    // External update (preset/import) lands while the field is focused.
    rerender({ value: 99 });
    expect(result.current.draft).toBe("12");
    act(() => result.current.handleBlur());
    // The user's final draft wins over the stale external value.
    expect(onCommit).toHaveBeenCalledWith(12);
    expect(result.current.draft).toBe("12");
  });

  it("commits typed values unclamped; range validation lives elsewhere", () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useNumericDraft(20, onCommit, { min: 1, max: 50000 }));
    act(() => result.current.handleChange("5000000"));
    // useSettingsValidation rejects out-of-range settings; the draft hook
    // deliberately does not clamp typing (only steppers clamp).
    expect(onCommit).toHaveBeenCalledWith(5000000);
  });

  it("syncs external value updates while not focused", () => {
    const onCommit = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useNumericDraft(value, onCommit), {
      initialProps: { value: 5 },
    });
    rerender({ value: 9 });
    expect(result.current.draft).toBe("9");
  });

  it("does not overwrite an active draft on external updates", () => {
    const onCommit = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useNumericDraft(value, onCommit), {
      initialProps: { value: 5 },
    });
    act(() => result.current.handleFocus());
    act(() => result.current.handleChange("12"));
    rerender({ value: 99 });
    expect(result.current.draft).toBe("12");
  });

  it("steps with clamping and skips no-op commits at bounds", () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => {
      const [value, setValue] = React.useState(5);
      return useNumericDraft(
        value,
        (next) => {
          onCommit(next);
          setValue(next);
        },
        { min: 0, max: 6 },
      );
    });
    act(() => result.current.stepBy(1));
    expect(onCommit).toHaveBeenCalledWith(6);
    act(() => result.current.stepBy(1));
    expect(onCommit).toHaveBeenCalledTimes(1);
    act(() => result.current.stepBy(-1));
    expect(onCommit).toHaveBeenLastCalledWith(5);
  });
});
