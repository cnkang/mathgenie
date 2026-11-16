import userEvent from "@testing-library/user-event";
import React, { useState } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { render, screen } from "../../../tests/helpers/testUtils";
import RangeInput from "./RangeInput";

describe("RangeInput", () => {
  it("renders and updates values", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const Wrapper: React.FC = () => {
      const [val, setVal] = useState<[number, number]>([1, 10]);
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
        />
      );
    };
    render(<Wrapper />);

    const from = screen.getByLabelText("From") as HTMLInputElement;
    const to = screen.getByLabelText("To") as HTMLInputElement;
    expect(from.value).toBe("1");
    expect(to.value).toBe("10");

    await user.clear(from);
    // Controlled round-trip: Number("") -> 0 renders as "0".
    expect(from.value).toBe("0");

    await user.type(from, "3");
    // user-event >= 14.6.9 keeps the raw typed string in number inputs like a
    // real browser, so the DOM may show a leading zero ("03") while the
    // component state is normalized to the number 3 via Number().
    expect(handleChange).toHaveBeenLastCalledWith([3, 10]);

    await user.clear(to);
    await user.type(to, "12");
    expect(handleChange).toHaveBeenLastCalledWith([3, 12]);
  });
});
