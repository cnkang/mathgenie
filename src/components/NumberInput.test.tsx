import { fireEvent, render, screen } from "@testing-library/react";
import NumberInput from "./NumberInput";

describe("NumberInput", () => {
  const defaultProps = {
    id: "test-input",
    label: "Test Input",
    value: 10,
    onChange: vi.fn(),
    min: 1,
    max: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders with basic props", () => {
    render(<NumberInput {...defaultProps} />);

    expect(screen.getByDisplayValue("10")).toBeDefined();
    expect(screen.getByText("Test Input")).toBeDefined();
  });

  test("calls onChange when value changes", () => {
    render(<NumberInput {...defaultProps} />);

    const input = screen.getByDisplayValue("10");
    fireEvent.change(input, { target: { value: "25" } });

    expect(defaultProps.onChange).toHaveBeenCalledWith(25);
  });

  test("handles empty input", () => {
    render(<NumberInput {...defaultProps} />);

    const input = screen.getByDisplayValue("10");
    fireEvent.change(input, { target: { value: "" } });

    expect(defaultProps.onChange).toHaveBeenCalledWith(1);
  });

  test("shows required indicator when required", () => {
    render(<NumberInput {...defaultProps} required />);

    expect(screen.getByLabelText("required")).toBeDefined();
  });

  test("applies placeholder when provided", () => {
    render(<NumberInput {...defaultProps} placeholder="Enter number" />);

    const input = screen.getByDisplayValue("10");
    expect(input.getAttribute("placeholder")).toBe("Enter number");
  });

  test("handles blur event", () => {
    render(<NumberInput {...defaultProps} />);

    const input = screen.getByDisplayValue("10");
    fireEvent.blur(input);

    // Should not throw error
    expect(input).toBeDefined();
  });

  test("handles invalid number input", () => {
    render(<NumberInput {...defaultProps} />);

    const input = screen.getByDisplayValue("10");
    fireEvent.change(input, { target: { value: "abc" } });

    // Should handle gracefully
    expect(input).toBeDefined();
  });
});
