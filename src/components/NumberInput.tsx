import React, { ChangeEvent, useOptimistic, useTransition } from 'react';
import type { NumberInputProps } from '../types';

interface ExtendedNumberInputProps extends NumberInputProps {
  required?: boolean;
  placeholder?: string;
}

/**
 * NumberInput Component - Mobile-friendly number input with validation and TypeScript
 * Enhanced with React 19 features for better UX
 * Provides a consistent number input experience across devices
 */
const NumberInput: React.FC<ExtendedNumberInputProps> = ({
  id,
  label,
  value,
  onChange,
  min = 1,
  max = 1000,
  required = false,
  placeholder = '',
  ...props
}) => {
  // React 19: Use transitions for smooth updates
  const [isPending, startTransition] = useTransition();

  // React 19: Optimistic updates for better perceived performance
  const [optimisticValue, setOptimisticValue] = useOptimistic(
    value,
    (currentValue: number, newValue: number | string) => {
      return typeof newValue === 'string' ? parseInt(newValue, 10) || currentValue : newValue;
    },
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const inputValue = e.target.value;
    const newValue = parseInt(inputValue, 10);

    // Optimistically update the UI immediately
    setOptimisticValue(inputValue);

    // Then validate and update the actual state
    startTransition(() => {
      if (!isNaN(newValue) && newValue >= min && newValue <= max) {
        onChange(newValue);
      } else if (inputValue === '') {
        onChange(min); // Reset to minimum value for empty input
      }
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    const newValue = parseInt(e.target.value, 10);
    startTransition(() => {
      if (isNaN(newValue) || newValue < min) {
        onChange(min);
      } else if (newValue > max) {
        onChange(max);
      }
    });
  };

  return (
    <div className="number-input-container">
      {label && (
        <label htmlFor={id} className="number-input-label">
          {label}
          {required && (
            <span className="required-indicator" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      <input
        type="number"
        id={id}
        value={optimisticValue}
        onChange={handleChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        required={required}
        placeholder={placeholder}
        // Mobile-friendly attributes
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={`${label} (${min} to ${max})`}
        // React 19: Show pending state
        style={{ opacity: isPending ? 0.7 : 1 }}
        {...props}
      />
      {isPending && (
        <div className="input-pending-indicator" aria-hidden="true">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default NumberInput;
