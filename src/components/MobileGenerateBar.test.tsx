import { act } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { fireEvent, render, screen } from "../../tests/helpers/testUtils";
import MobileGenerateBar from "./MobileGenerateBar";

const t = (key: string) => key;

describe("MobileGenerateBar", () => {
  it("renders the generate action and fires onGenerate", () => {
    const onGenerate = vi.fn();
    render(<MobileGenerateBar t={t} isGenerating={false} onGenerate={onGenerate} />);
    const button = screen.getByRole("button", { name: /buttons\.generate/ });
    expect(button).toHaveTextContent("buttons.generate");
    fireEvent.click(button);
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it("shows the generating label and disables the button while busy", () => {
    const onGenerate = vi.fn();
    render(<MobileGenerateBar t={t} isGenerating onGenerate={onGenerate} />);
    const button = screen.getByRole("button", { name: /buttons\.generat/ }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveTextContent("buttons.generating");
    expect(button.getAttribute("aria-label")).toContain("buttons.generating");
    fireEvent.click(button);
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it("hides while the generate card is on screen", () => {
    const callbacks: IntersectionObserverCallback[] = [];
    class MockObserver {
      constructor(callback: IntersectionObserverCallback) {
        callbacks.push(callback);
      }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
    }
    const original = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = MockObserver as unknown as typeof IntersectionObserver;
    const card = document.createElement("button");
    card.className = "generate-card";
    document.body.appendChild(card);

    try {
      const { container } = render(
        <MobileGenerateBar t={t} isGenerating={false} onGenerate={vi.fn()} />,
      );
      expect(container.querySelector(".mobile-generate-bar")).not.toBeNull();

      act(() => {
        for (const callback of callbacks) {
          callback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            {} as IntersectionObserver,
          );
        }
      });
      expect(container.querySelector(".mobile-generate-bar")).toBeNull();
    } finally {
      globalThis.IntersectionObserver = original;
      card.remove();
    }
  });
});
