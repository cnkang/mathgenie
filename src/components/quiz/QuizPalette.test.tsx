import { describe, expect, it, vi } from "vite-plus/test";
import { fireEvent, render, screen } from "../../../tests/helpers/testUtils";
import type { Problem } from "@/types";
import QuizPalette from "./QuizPalette";

const t = (key: string, params?: Record<string, string | number>) => {
  if (key === "quiz.palette.title") return `Jump (${params?.answered}/${params?.total})`;
  if (key === "quiz.palette.jumpLabel") return `Q${params?.number} ${params?.state}`;
  if (key === "quiz.palette.truncated") return `first ${params?.count}`;
  return key;
};

const problems: Problem[] = [
  { id: 1, text: "1 + 1 = ", isAnswered: true, isCorrect: true },
  { id: 2, text: "2 + 2 = ", isAnswered: true, isCorrect: false },
  { id: 3, text: "3 + 3 = " },
];

describe("QuizPalette", () => {
  it("renders one item per problem with state classes and current marker", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <QuizPalette t={t} problems={problems} currentIndex={2} onSelect={onSelect} />,
    );
    const items = container.querySelectorAll(".palette-item");
    expect(items).toHaveLength(3);
    expect(items[0].className).toContain("correct");
    expect(items[1].className).toContain("incorrect");
    expect(items[2].className).toContain("unanswered");
    expect(items[2].className).toContain("current");
    expect(items[2].getAttribute("aria-current")).toBe("true");
    expect(screen.getByText("Jump (2/3)")).toBeInTheDocument();
  });

  it("jumps to the clicked problem", () => {
    const onSelect = vi.fn();
    render(<QuizPalette t={t} problems={problems} currentIndex={0} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "Q3 quiz.palette.unanswered" }));
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it("caps the grid for very large quizzes and shows a note", () => {
    const many: Problem[] = Array.from({ length: 250 }, (_, index) => ({
      id: index + 1,
      text: `${index} + 1 = `,
    }));
    const { container } = render(
      <QuizPalette t={t} problems={many} currentIndex={0} onSelect={vi.fn()} />,
    );
    expect(container.querySelectorAll(".palette-item")).toHaveLength(200);
    expect(screen.getByText("first 200")).toBeInTheDocument();
  });
});
