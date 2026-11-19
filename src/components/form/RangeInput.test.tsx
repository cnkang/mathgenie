import userEvent from "@testing-library/user-event";
import React, { useState } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { fireEvent, render, screen } from "../../../tests/helpers/testUtils";
import RangeInput from "./RangeInput";

type SetupOptions = {
  initial?: [number, number];
  min?: number;
  max?: number;
};

const setup = ({ initial = [1, 10], min, max }: SetupOptions = {}) => {
  const handleChange = vi.fn();
  const Wrapper: React.FC = () => {
    const [val, setVal] = useState<[number, number]>(initial);
    return (
      <RangeInput
        id="test-range"
        label="Number Range"
        value={val}
        onChange={(next) => {
          handleChange(next);
          setVal(next);
        }}
        ariaMinLabel="From"
        ariaMaxLabel="To"
        decreaseLabel="Decrease value"
        increaseLabel="Increase value"
        min={min}
        max={max}
      />
    );
  };
  render(<Wrapper />);
  return {
    handleChange,
    from: screen.getByLabelText("From") as HTMLInputElement,
    to: screen.getByLabelText("To") as HTMLInputElement,
  };
};

describe("RangeInput", () => {
  it("renders and commits typed values", async () => {
    const user = userEvent.setup();
    const { handleChange, from, to } = setup();
    expect(from.value).toBe("1");
    expect(to.value).toBe("10");

    await user.clear(from);
    await user.type(from, "3");
    expect(handleChange).toHaveBeenLastCalledWith([3, 10]);

    await user.clear(to);
    await user.type(to, "12");
    expect(handleChange).toHaveBeenLastCalledWith([3, 12]);
  });

  it("keeps an empty draft instead of snapping to 0 and restores on blur", async () => {
    const user = userEvent.setup();
    const { handleChange, from } = setup();

    await user.clear(from);
    expect(from.value).toBe("");
    expect(handleChange).not.toHaveBeenCalled();

    fireEvent.blur(from);
    expect(from.value).toBe("1");
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("does not commit partial input like a lone minus sign", async () => {
    const user = userEvent.setup();
    const { handleChange, from } = setup();

    await user.clear(from);
    await user.type(from, "-");
    expect(handleChange).not.toHaveBeenCalled();

    await user.type(from, "5");
    expect(handleChange).toHaveBeenLastCalledWith([-5, 10]);
  });

  it("steps values with the stepper buttons", async () => {
    const user = userEvent.setup();
    const { handleChange, from } = setup();

    await user.click(screen.getByRole("button", { name: "Increase value: From" }));
    expect(handleChange).toHaveBeenLastCalledWith([2, 10]);
    expect(from.value).toBe("2");

    await user.click(screen.getByRole("button", { name: "Decrease value: From" }));
    expect(handleChange).toHaveBeenLastCalledWith([1, 10]);
    expect(from.value).toBe("1");
  });

  it("clamps stepper values to min and max", async () => {
    const user = userEvent.setup();
    const { handleChange, from } = setup({ initial: [5, 10], min: 0, max: 5 });

    await user.click(screen.getByRole("button", { name: "Increase value: From" }));
    expect(handleChange).not.toHaveBeenCalled();
    expect(from.value).toBe("5");
  });
});
