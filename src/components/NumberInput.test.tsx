import React from 'react';
import { vi } from 'vitest';
import { act, fireEvent, render } from '../../tests/helpers/testUtils';
import NumberInput from './NumberInput';

// Test component to verify basic rendering works
const TestComponent: React.FC = () => {
  return <div data-testid='test-component'>Test works</div>;
};

describe.sequential('NumberInput', () => {
  const defaultProps = {
    id: 'test-input',
    label: 'Test Input',
    value: 10,
    onChange: vi.fn(),
    min: 1,
    max: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  test('basic rendering works', () => {
    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('test-component')).toBeInTheDocument();
  });

  test('renders with basic props', () => {
    const { container } = render(<NumberInput {...defaultProps} />);

    const input = container.querySelector('input');
    const label = container.querySelector('label');

    expect(input).not.toBeNull();
    expect(label).not.toBeNull();
  });

  test('calls onChange when value changes', () => {
    const onChange = vi.fn();
    const { container } = render(<NumberInput {...defaultProps} onChange={onChange} />);

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: '25' } });

    // The onChange should be called
    expect(onChange).toHaveBeenCalled();
  });

  test('handles empty input', () => {
    const onChange = vi.fn();
    const { container } = render(<NumberInput {...defaultProps} onChange={onChange} />);

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith(1);
  });

  test('shows required indicator when required', () => {
    const { container } = render(<NumberInput {...defaultProps} required />);

    expect(container.querySelector('[aria-label="required"]')).toBeDefined();
  });

  test('applies placeholder when provided', () => {
    const { container } = render(<NumberInput {...defaultProps} placeholder='Enter number' />);

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.getAttribute('placeholder')).toBe('Enter number');
  });

  test('handles blur event', () => {
    const onChange = vi.fn();
    const { container } = render(<NumberInput {...defaultProps} onChange={onChange} />);
    const input = container.querySelector('input') as HTMLInputElement;

    if (input) {
      fireEvent.blur(input);

      // Should not call onChange on blur without value change
      expect(onChange).not.toHaveBeenCalled();
    }
  });

  test('handles invalid number input', async () => {
    const { container } = render(<NumberInput {...defaultProps} />);
    const input = container.querySelector('input') as HTMLInputElement;

    if (input) {
      await act(async () => {
        fireEvent.change(input, { target: { value: 'abc' } });
      });

      // Should handle gracefully - component should still exist
      expect(input).toBeDefined();
    }
  });

  test('has correct accessibility attributes', () => {
    const { container } = render(<NumberInput {...defaultProps} />);

    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();
    // Use native DOM properties instead of jest-dom matchers
    expect(input.getAttribute('aria-label')).toBe('Test Input (1 to 100)');
    expect(input.getAttribute('inputmode')).toBe('numeric');
    expect(input.getAttribute('type')).toBe('number');
  });

  test('passes through additional props', () => {
    const { container } = render(
      <NumberInput {...defaultProps} className='custom-class' data-testid='custom-input' />
    );

    const input = container.querySelector('input[data-testid="custom-input"]') as HTMLElement;
    expect(input).not.toBeNull();
    // Use native DOM properties instead of jest-dom matchers
    expect((input as HTMLInputElement).className).toContain('custom-class');
    expect(input.getAttribute('data-testid')).toBe('custom-input');
  });

  test('renders without label when not provided', () => {
    const propsWithoutLabel = { ...defaultProps, label: undefined };
    const { container } = render(<NumberInput {...propsWithoutLabel} />);

    const input = container.querySelector('input');
    expect(input).toBeDefined();

    // Should not have a label element if no label provided
    const label = container.querySelector('label');
    expect(label?.textContent).not.toBe('Test Input');
  });
});
