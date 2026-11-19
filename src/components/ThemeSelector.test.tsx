import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { fireEvent, render, screen } from "../../tests/helpers/testUtils";
import ThemeSelector from "./ThemeSelector";

vi.mock("../i18n", async () => {
  const { mockUseTranslation } = await import("../../tests/helpers/mockTranslations");
  return mockUseTranslation({
    "theme.label": "Theme",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",
  });
});

afterEach(() => {
  localStorage.removeItem("mathgenie-theme");
  document.documentElement.removeAttribute("data-theme");
});

describe("ThemeSelector", () => {
  it("renders three options with system active by default", () => {
    render(<ThemeSelector />);
    expect(screen.getByRole("group", { name: "Theme" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Light" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
    expect(screen.getByRole("button", { name: "System" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("switches the document theme and persists the choice", () => {
    render(<ThemeSelector />);
    fireEvent.click(screen.getByRole("button", { name: "Dark" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("mathgenie-theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "Dark" }).getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Light" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("mathgenie-theme")).toBe("light");
  });
});
