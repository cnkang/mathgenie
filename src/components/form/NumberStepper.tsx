import React from "react";
import { useNumericDraft } from "@/hooks/useNumericDraft";
import "./NumberStepper.css";

type NumberStepperProps = {
  id: string;
  value: number;
  onCommit: (next: number) => void;
  ariaLabel: string;
  decreaseLabel: string;
  increaseLabel: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  inputClassName?: string;
};

/**
 * Numeric input with touch-friendly −/+ steppers and draft-state editing
 * (empty input no longer snaps the setting to 0). Steppers stay out of
 * the tab order: keyboard users adjust values with the native arrow keys.
 */
const NumberStepper: React.FC<NumberStepperProps> = ({
  id,
  value,
  onCommit,
  ariaLabel,
  decreaseLabel,
  increaseLabel,
  min,
  max,
  step = 1,
  placeholder,
  inputClassName,
}) => {
  const draft = useNumericDraft(value, onCommit, { min, max, step });

  return (
    <div className="range-stepper">
      <button
        type="button"
        className="stepper-btn"
        onClick={() => draft.stepBy(-1)}
        aria-label={`${decreaseLabel}: ${ariaLabel}`}
        tabIndex={-1}
      >
        <span aria-hidden="true">−</span>
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={draft.draft}
        onChange={(e) => draft.handleChange(e.target.value)}
        onFocus={draft.handleFocus}
        onBlur={draft.handleBlur}
        min={min}
        max={max}
        step={step}
        aria-label={ariaLabel}
        placeholder={placeholder}
        className={inputClassName}
      />
      <button
        type="button"
        className="stepper-btn"
        onClick={() => draft.stepBy(1)}
        aria-label={`${increaseLabel}: ${ariaLabel}`}
        tabIndex={-1}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
};

export default NumberStepper;
