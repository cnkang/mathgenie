import React from 'react';
import './RangeInput.css';

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
  fromPlaceholder,
  toPlaceholder,
  className,
}) => {
  const [from, to] = value;
  const handleFrom = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const next = Number(e.target.value);
    onChange([next, to]);
  };
  const handleTo = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const next = Number(e.target.value);
    onChange([from, next]);
  };

  return (
    <div className={className || 'range-input'}>
      <label htmlFor={idFrom ?? `${id}-from`} className='range-label'>
        {label}
      </label>
      <div className='range-fields'>
        <input
          id={idFrom ?? `${id}-from`}
          type='number'
          inputMode='numeric'
          value={from}
          onChange={handleFrom}
          min={min}
          max={max}
          step={step}
          aria-label={ariaMinLabel || `${label} from`}
          placeholder={fromPlaceholder}
          className='range-from'
        />
        <span className='range-sep' aria-hidden>
          –
        </span>
        <input
          id={idTo ?? `${id}-to`}
          type='number'
          inputMode='numeric'
          value={to}
          onChange={handleTo}
          min={min}
          max={max}
          step={step}
          aria-label={ariaMaxLabel || `${label} to`}
          placeholder={toPlaceholder}
          className='range-to'
        />
      </div>
    </div>
  );
};

export default RangeInput;
