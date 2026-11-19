import { describe, expect, test, vi } from "vite-plus/test";
import { render, screen } from "../../tests/helpers/testUtils";
import type { Settings } from "../types";
import InfoPanel from "./InfoPanel";

// Mock the translation system
vi.mock("../i18n", async () => {
  const { mockUseTranslation } = await import("../../tests/helpers/mockTranslations");
  return mockUseTranslation({
    "infoPanel.title": "Problem Statistics",
    "infoPanel.difficulty.beginner": "Beginner",
    "infoPanel.difficulty.intermediate": "Intermediate",
    "infoPanel.difficulty.advanced": "Advanced",
    "infoPanel.difficulty.expert": "Expert",
    "infoPanel.stats.currentProblems": "Current Problems",
    "infoPanel.stats.totalGenerated": "Total Generated",
    "infoPanel.stats.operationTypes": "Operation Types",
    "infoPanel.stats.difficultyLevel": "Difficulty Level",
    "infoPanel.progress.title": "Learning Progress",
    "infoPanel.progress.completed": "{{percent}}% completed (Goal: 100 problems)",
    "infoPanel.recentResults.title": "Recent Results",
    "infoPanel.recentResults.score": "Score: {{score}}",
    "infoPanel.recentResults.grade": "Grade",
    "infoPanel.recentResults.accuracy": "Accuracy",
  });
});

// Mock the progress bar hook
vi.mock("../hooks/useProgressBar", () => ({
  useProgressBar: vi.fn(() => ({
    progressBarProps: { className: "progress-bar", role: "progressbar" },
    progressFillProps: { className: "progress-fill", style: { width: "0%" } },
  })),
}));

describe("InfoPanel", { concurrent: false }, () => {
  beforeEach(() => {
    localStorage.removeItem("mathgenie-session-stats");
    localStorage.removeItem("mathgenie-explicit-generations");
  });

  const mockSettings: Settings = {
    numProblems: 10,
    operations: ["+", "-"],
    numRange: [1, 20],
    numOperandsRange: [2, 3],
    resultRange: [1, 40],
    allowNegative: false,
    showAnswers: false,
    fontSize: 12,
    lineSpacing: 1.5,
    paperSize: "a4" as const,
    enableGrouping: false,
    problemsPerGroup: 20,
    totalGroups: 1,
  };

  test("renders with proper structure and content", () => {
    render(<InfoPanel problems={[]} settings={mockSettings} />);

    expect(screen.getByText("Problem Statistics")).toBeInTheDocument();
    expect(screen.getByText("Current Problems")).toBeInTheDocument();
    expect(screen.getByText("Operation Types")).toBeInTheDocument();
    expect(screen.getByText("Difficulty Level")).toBeInTheDocument();
  });

  test("displays statistics correctly", () => {
    render(<InfoPanel problems={[]} settings={mockSettings} />);

    expect(screen.getAllByLabelText("Current Problems: 0")[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText("Total Generated: 0")[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText("Operation Types: 0")[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText("Difficulty Level: Beginner")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Beginner")[0]).toBeInTheDocument();
  });

  test("displays statistics correctly with problems", () => {
    const mockProblems = [
      { id: 1, text: "2 + 3 = " },
      { id: 2, text: "5 - 1 = " },
      { id: 3, text: "4 + 6 = " },
    ];

    render(<InfoPanel problems={mockProblems} settings={mockSettings} />);

    expect(screen.getAllByLabelText("Current Problems: 3")[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText("Operation Types: 2")[0]).toBeInTheDocument();
    expect(screen.getAllByLabelText("Difficulty Level: Beginner")[0]).toBeInTheDocument();
  });

  test("renders without crashing with empty problems", () => {
    render(<InfoPanel problems={[]} settings={mockSettings} />);
    expect(screen.getAllByText("Problem Statistics")[0]).toBeInTheDocument();
  });

  test("shows quiz results when provided", () => {
    const mockProblems = [{ id: 1, text: "2 + 2 = " }];
    const quizResult = {
      score: 80,
      grade: "B",
      correctAnswers: 8,
      incorrectAnswers: 2,
      totalProblems: 10,
      feedback: "Good job!",
    };

    render(<InfoPanel problems={mockProblems} settings={mockSettings} quizResult={quizResult} />);

    expect(screen.getByText(/Recent Results/)).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
  });

  test("does not show quiz results when not provided", () => {
    render(<InfoPanel problems={[]} settings={mockSettings} />);
    expect(screen.queryByText(/Recent Results/)).not.toBeInTheDocument();
  });

  test("persists generation stats across remounts", () => {
    const mockProblems = [{ id: 1, text: "2 + 2 = " }];
    const first = render(
      <InfoPanel problems={mockProblems} settings={mockSettings} explicitGenerations={1} />,
    );
    expect(screen.getAllByLabelText("Total Generated: 1")[0]).toBeInTheDocument();
    first.unmount();

    render(<InfoPanel problems={[]} settings={mockSettings} explicitGenerations={1} />);
    expect(screen.getAllByLabelText("Total Generated: 1")[0]).toBeInTheDocument();
  });

  test("does not double-count the same batch when remounted with it", () => {
    const mockProblems = [{ id: 1, text: "2 + 2 = " }];
    const first = render(
      <InfoPanel problems={mockProblems} settings={mockSettings} explicitGenerations={1} />,
    );
    expect(screen.getAllByLabelText("Total Generated: 1")[0]).toBeInTheDocument();
    first.unmount();

    // Same array reference (quiz-mode exit remounts InfoPanel with the
    // current problems): must not count again.
    render(<InfoPanel problems={mockProblems} settings={mockSettings} explicitGenerations={1} />);
    expect(screen.getAllByLabelText("Total Generated: 1")[0]).toBeInTheDocument();
  });

  test("does not count auto-regenerations from settings edits", () => {
    const firstBatch = [{ id: 1, text: "2 + 2 = " }];
    const { rerender } = render(
      <InfoPanel problems={firstBatch} settings={mockSettings} explicitGenerations={1} />,
    );
    expect(screen.getAllByLabelText("Total Generated: 1")[0]).toBeInTheDocument();

    // Settings edit auto-regenerates a new array without an explicit click.
    const autoBatch = [
      { id: 2, text: "3 + 3 = " },
      { id: 3, text: "4 + 4 = " },
    ];
    rerender(<InfoPanel problems={autoBatch} settings={mockSettings} explicitGenerations={1} />);
    expect(screen.getAllByLabelText("Total Generated: 1")[0]).toBeInTheDocument();
  });

  test("rejects corrupt stored stats", () => {
    localStorage.setItem(
      "mathgenie-session-stats",
      JSON.stringify({ totalGenerated: -5, sessionsCount: 0, lastCountedGeneration: 0 }),
    );
    render(<InfoPanel problems={[]} settings={mockSettings} />);
    expect(screen.getAllByLabelText("Total Generated: 0")[0]).toBeInTheDocument();
  });

  test("preserves legacy stats without the generation cursor", () => {
    localStorage.setItem(
      "mathgenie-session-stats",
      JSON.stringify({ totalGenerated: 40, sessionsCount: 2 }),
    );
    // Counter restored from a previous session: the auto-generated batch on
    // load must not be counted, and the legacy totals must survive.
    const problems = [{ id: 1, text: "2 + 2 = " }];
    render(<InfoPanel problems={problems} settings={mockSettings} explicitGenerations={2} />);
    expect(screen.getAllByLabelText("Total Generated: 40")[0]).toBeInTheDocument();
  });

  test("counts the next explicit generation after a reload with stored cursor", () => {
    localStorage.setItem(
      "mathgenie-session-stats",
      JSON.stringify({ totalGenerated: 40, sessionsCount: 2, lastCountedGeneration: 2 }),
    );
    const problems = [{ id: 1, text: "2 + 2 = " }];
    const { rerender } = render(
      <InfoPanel problems={problems} settings={mockSettings} explicitGenerations={2} />,
    );
    expect(screen.getAllByLabelText("Total Generated: 40")[0]).toBeInTheDocument();

    // User clicks Generate after reload: counter advances, new batch counts.
    const nextBatch = [{ id: 2, text: "3 + 3 = " }];
    rerender(<InfoPanel problems={nextBatch} settings={mockSettings} explicitGenerations={3} />);
    expect(screen.getAllByLabelText("Total Generated: 41")[0]).toBeInTheDocument();
  });
});
