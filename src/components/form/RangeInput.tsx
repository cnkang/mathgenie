import React from "react";
import NumberStepper from "./NumberStepper";
import "./RangeInput.css";

type RangeInputProps = {
  id: string;
  idFrom?: string;
  idTo?: string;
  label: string;
  value: [number, number];
  onChange: (next: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  ariaMinLabel?: string;
  ariaMaxLabel?: string;
  decreaseLabel: string;
  increaseLabel: string;
  fromPlaceholder?: string;
  toPlaceholder?: string;
  className?: string;
};

const RangeInput: React.FC<RangeInputProps> = ({
  id,
  idFrom,
  idTo,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  ariaMinLabel,
  ariaMaxLabel,
  decreaseLabel,
  increaseLabel,
  fromPlaceholder,
  toPlaceholder,
  className,
}) => {
  const [from, to] = value;

  return (
    <div className={className || "range-input"}>
      <label htmlFor={idFrom ?? `${id}-from`} className="range-label">
        {label}
      </label>
      <div className="range-fields">
        <NumberStepper
          id={idFrom ?? `${id}-from`}
          value={from}
          onCommit={(next) => onChange([next, to])}
          ariaLabel={ariaMinLabel || `${label} from`}
          decreaseLabel={decreaseLabel}
          increaseLabel={increaseLabel}
          min={min}
          max={max}
          step={step}
          placeholder={fromPlaceholder}
          inputClassName="range-from"
        />
        <span className="range-sep" aria-hidden>
          –
        </span>
        <NumberStepper
          id={idTo ?? `${id}-to`}
          value={to}
          onCommit={(next) => onChange([from, next])}
          ariaLabel={ariaMaxLabel || `${label} to`}
          decreaseLabel={decreaseLabel}
          increaseLabel={increaseLabel}
          min={min}
          max={max}
          step={step}
          placeholder={toPlaceholder}
          inputClassName="range-to"
        />
      </div>
    </div>
  );
};

export default RangeInput;
