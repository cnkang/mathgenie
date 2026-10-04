import React from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { I18nProvider, useTranslation } from "./index";

const french = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock("./translations/fr.ts", () => ({
  get default() {
    return french.load();
  },
}));

const Translation = () => {
  const { t, isLoading } = useTranslation();
  return <output>{isLoading ? "loading" : t("app.subtitle")}</output>;
};

beforeEach(() => {
  vi.useFakeTimers();
  french.load.mockReset();
  localStorage.setItem("mathgenie-language", "fr");
});
afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

describe("translation retry ordering", () => {
  it("retries sequentially with backoff and stops as soon as loading succeeds", async () => {
    french.load
      .mockImplementationOnce(() => {
        throw new Error("first attempt");
      })
      .mockImplementationOnce(() => {
        throw new Error("second attempt");
      })
      .mockReturnValue({ app: { subtitle: "French translation" } });
    render(
      <I18nProvider>
        <Translation />
      </I18nProvider>,
    );
    await act(async () => vi.advanceTimersByTimeAsync(0));
    expect(french.load).toHaveBeenCalledTimes(1);
    await act(async () => vi.advanceTimersByTimeAsync(199));
    expect(french.load).toHaveBeenCalledTimes(1);
    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(french.load).toHaveBeenCalledTimes(2);
    await act(async () => vi.advanceTimersByTimeAsync(399));
    expect(french.load).toHaveBeenCalledTimes(2);
    await act(async () => vi.advanceTimersByTimeAsync(1));
    expect(french.load).toHaveBeenCalledTimes(3);
    expect(screen.getByRole("status").textContent).toBe("French translation");
    await act(async () => vi.advanceTimersByTimeAsync(1000));
    expect(french.load).toHaveBeenCalledTimes(3);
  });

  it("falls back to English after exactly three failed attempts", async () => {
    await import("./translations/en");
    french.load.mockImplementation(() => {
      throw new Error("unavailable");
    });
    render(
      <I18nProvider>
        <Translation />
      </I18nProvider>,
    );
    await act(async () => vi.advanceTimersByTimeAsync(600));
    expect(french.load).toHaveBeenCalledTimes(3);
    expect(screen.getByRole("status").textContent).toBe(
      "Generate customized math problems for practice and learning",
    );
  });
});
