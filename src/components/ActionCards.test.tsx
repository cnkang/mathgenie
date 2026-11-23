import React from "react";
import { render, screen, fireEvent } from "../../tests/helpers/testUtils";
import ActionCards from "./ActionCards";

const t = (key: string, params?: Record<string, string | number>) => {
  let result = key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      result = result.replaceAll(new RegExp(String.raw`\{\{${k}\}\}`, "g"), String(v));
    });
  }
  return result;
};

describe("ActionCards", { concurrent: false }, () => {
  test("renders buttons and labels", () => {
    render(
      <ActionCards
        t={t}
        problemsCount={3}
        onGenerate={() => {}}
        onPreviewPdf={() => {}}
        onStartQuiz={() => {}}
      />,
    );

    expect(
      screen.getByRole("group", { name: /infoPanel\.quickActions\.title/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /buttons\.generate/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pdf\.previewTitle/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /infoPanel\.quickActions\.startQuiz/i }),
    ).toBeInTheDocument();
  });

  test("disables print preview and quiz when no problems", () => {
    render(
      <ActionCards
        t={t}
        problemsCount={0}
        onGenerate={() => {}}
        onPreviewPdf={() => {}}
        onStartQuiz={() => {}}
      />,
    );

    const download = screen.getByRole("button", {
      name: /pdf\.previewTitle/i,
    }) as HTMLButtonElement;
    const quiz = screen.getByRole("button", {
      name: /infoPanel\.quickActions\.startQuiz/i,
    }) as HTMLButtonElement;

    expect(download.disabled).toBe(true);
    expect(quiz.disabled).toBe(true);
  });

  test("fires callbacks when clicked", () => {
    const onGenerate = vi.fn();
    const onPreviewPdf = vi.fn();
    const onStartQuiz = vi.fn();

    render(
      <ActionCards
        t={t}
        problemsCount={2}
        onGenerate={onGenerate}
        onPreviewPdf={onPreviewPdf}
        onStartQuiz={onStartQuiz}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /buttons\.generate/i }));
    fireEvent.click(screen.getByRole("button", { name: /pdf\.previewTitle/i }));
    fireEvent.click(screen.getByRole("button", { name: /infoPanel\.quickActions\.startQuiz/i }));

    expect(onGenerate).toHaveBeenCalledTimes(1);
    expect(onPreviewPdf).toHaveBeenCalledTimes(1);
    expect(onStartQuiz).toHaveBeenCalledTimes(1);
  });
});
