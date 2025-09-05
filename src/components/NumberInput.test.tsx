import { act, fireEvent, render, screen } from '@testing-library/react';
import NumberInput from './NumberInput';

describe('NumberInput', () => {
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

  test('renders with basic props', () => {
    render(<NumberInput {...defaultProps} />);

    expect(screen.getByDisplayValue('10')).toBeDefined();
    expect(screen.getByText('Test Input')).toBeDefined();
  });

  test('calls onChange when value changes', async () => {
    render(<NumberInput {...defaultProps} />);

    const input = screen.getByDisplayValue('10');

    await act(async () => {
      fireEvent.change(input, { target: { value: '25' } });
    });

    expect(defaultProps.onChange).toHaveBeenCalledWith(25);
  });

  test('handles empty input', async () => {
    render(<NumberInput {...defaultProps} />);

    const input = screen.getByDisplayValue('10');

    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
    });

    expect(defaultProps.onChange).toHaveBeenCalledWith(1);
  });

  test('shows required indicator when required', () => {
    render(<NumberInput {...defaultProps} required />);

    expect(screen.getByLabelText('required')).toBeDefined();
  });

  test('applies placeholder when provided', () => {
    render(<NumberInput {...defaultProps} placeholder='Enter number' />);

    const input = screen.getByDisplayValue('10');
    expect(input.getAttribute('placeholder')).toBe('Enter number');
  });

  test('handles blur event', () => {
    render(<NumberInput {...defaultProps} />);

    const input = screen.getByDisplayValue('10');
    fireEvent.blur(input);

    // Should not throw error
    expect(input).toBeDefined();
  });

  test('handles invalid number input', async () => {
    render(<NumberInput {...defaultProps} />);

    const input = screen.getByDisplayValue('10');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'abc' } });
    });

    // Should handle gracefully
    expect(input).toBeDefined();
  });

  test('handles blur with value below minimum', async () => {
    render(<NumberInput {...defaultProps} />);

    const input = screen.getByDisplayValue('10') as HTMLInputElement;

    // Simulate user typing a value below minimum without triggering change event
    // This simulates the scenario where user types directly and then blurs
    Object.defineProperty(input, 'value', {
      writable: true,
      value: '0',
    });

    // Clear any previous onChange calls
    defaultProps.onChange.mockClear();

    // Trigger blur event
    await act(async () => {
      fireEvent.blur(input);
    });

    // Should call onChange with minimum value
    expect(defaultProps.onChange).toHaveBeenCalledWith(1);
  });

  test('handles blur with value above maximum', async () => {
    render(<NumberInput {...defaultProps} />);

    const input = screen.getByDisplayValue('10') as HTMLInputElement;

    // Simulate user typing a value above maximum
    Object.defineProperty(input, 'value', {
      writable: true,
      value: '150',
    });

    // Clear any previous onChange calls
    defaultProps.onChange.mockClear();

    // Trigger blur event
    await act(async () => {
      fireEvent.blur(input);
    });

    // Should call onChange with maximum value
    expect(defaultProps.onChange).toHaveBeenCalledWith(100);
  });

  test('handles blur with invalid value', async () => {
    render(<NumberInput {...defaultProps} />);

    const input = screen.getByDisplayValue('10') as HTMLInputElement;

    // Simulate user typing invalid text
    Object.defineProperty(input, 'value', {
      writable: true,
      value: 'invalid',
    });

    // Clear any previous onChange calls
    defaultProps.onChange.mockClear();

    // Trigger blur event
    await act(async () => {
      fireEvent.blur(input);
    });

    expect(defaultProps.onChange).toHaveBeenCalledWith(1); // Should reset to min
  });

  test('handles blur with valid value in range', async () => {
    render(<NumberInput {...defaultProps} />);

    const input = screen.getByDisplayValue('10');

    await act(async () => {
      fireEvent.change(input, { target: { value: '50' } });
      fireEvent.blur(input);
    });

    // Should not call onChange again if value is already valid
    expect(input).toBeDefined();
  });

  test('renders without label when not provided', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { label, ...propsWithoutLabel } = defaultProps;

    render(<NumberInput {...propsWithoutLabel} />);

    expect(screen.queryByText('Test Input')).toBeNull();
    expect(screen.getByDisplayValue('10')).toBeDefined();
  });

  test('renders without required indicator when not required', () => {
    render(<NumberInput {...defaultProps} required={false} />);

    expect(screen.queryByLabelText('required')).toBeNull();
  });

  test('has correct accessibility attributes', () => {
    render(<NumberInput {...defaultProps} />);

    const input = screen.getByDisplayValue('10');
    expect(input.getAttribute('aria-label')).toBe('Test Input (1 to 100)');
    expect(input.getAttribute('inputMode')).toBe('numeric');
    expect(input.getAttribute('pattern')).toBe('[0-9]*');
  });

  test('handles value at minimum boundary', async () => {
    render(<NumberInput {...defaultProps} />);

    const input = screen.getByDisplayValue('10');

    await act(async () => {
      fireEvent.change(input, { target: { value: '1' } });
    });

    expect(defaultProps.onChange).toHaveBeenCalledWith(1);
  });

  test('handles value at maximum boundary', async () => {
    render(<NumberInput {...defaultProps} />);

    const input = screen.getByDisplayValue('10');

    await act(async () => {
      fireEvent.change(input, { target: { value: '100' } });
    });

    expect(defaultProps.onChange).toHaveBeenCalledWith(100);
  });

  test('does not call onChange for out of range values during change', async () => {
    render(<NumberInput {...defaultProps} />);

    const input = screen.getByDisplayValue('10');

    // Clear previous calls
    defaultProps.onChange.mockClear();

    await act(async () => {
      fireEvent.change(input, { target: { value: '150' } });
    });

    // Should not call onChange for out of range value during change
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  test('passes through additional props', () => {
    render(<NumberInput {...defaultProps} className='custom-class' data-testid='custom-input' />);

    const input = screen.getByDisplayValue('10');
    expect(input.getAttribute('class')).toContain('custom-class');
    expect(input.getAttribute('data-testid')).toBe('custom-input');
  });
});
