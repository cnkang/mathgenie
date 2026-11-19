import userEvent from "@testing-library/user-event";
import React, { useState } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { fireEvent, render, screen } from "../../../tests/helpers/testUtils";
import NumberStepper from "./NumberStepper";

const setup = (initial = 20, min?: number, max?: number) => {
  const onCommit = vi.fn();
  const Wrapper: React.FC = () => {
    const [value, setValue] = useState(initial);
    return (
      <NumberStepper
        id="count"
        value={value}
        onCommit={(next) => {
          onCommit(next);
          setValue(next);
        }}
        ariaLabel="Number of problems"
        decreaseLabel="Decrease value"
        increaseLabel="Increase value"
        min={min}
        max={max}
      />
    );
  };
  render(<Wrapper />);
  return { onCommit, input: screen.getByLabelText("Number of problems") as HTMLInputElement };
};

describe("NumberStepper", () => {
  it("commits typed values immediately", async () => {
    const user = userEvent.setup();
    const { onCommit, input } = setup();
    await user.clear(input);
    await user.type(input, "30");
    expect(onCommit).toHaveBeenLastCalledWith(30);
  });

  it("does not commit an empty draft and restores on blur", async () => {
    const user = userEvent.setup();
    const { onCommit, input } = setup();
    await user.clear(input);
    expect(input.value).toBe("");
    expect(onCommit).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(input.value).toBe("20");
  });

  it("increments and decrements via steppers", async () => {
    const user = userEvent.setup();
    const { onCommit, input } = setup();
    await user.click(screen.getByRole("button", { name: "Increase value: Number of problems" }));
    expect(onCommit).toHaveBeenLastCalledWith(21);
    expect(input.value).toBe("21");
    await user.click(screen.getByRole("button", { name: "Decrease value: Number of problems" }));
    expect(onCommit).toHaveBeenLastCalledWith(20);
  });

  it("respects min and max bounds", async () => {
    const user = userEvent.setup();
    const { onCommit } = setup(1, 1, 10);
    await user.click(screen.getByRole("button", { name: "Decrease value: Number of problems" }));
    expect(onCommit).not.toHaveBeenCalled();
  });
});
