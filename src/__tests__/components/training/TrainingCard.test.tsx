import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TrainingCard from "@/components/training/TrainingCard";
import type { Training } from "@/types/training";

describe("TrainingCard", () => {
  const mockTraining: Training = {
    id: "test-1",
    slug: "test-training",
    title: "Test Training Title",
    description: "Test training description",
    type: "challenge",
    difficulty: "normal",
    tags: ["ui", "design"],
  };

  it("should render training title", () => {
    render(<TrainingCard training={mockTraining} />);

    expect(screen.getByText("Test Training Title")).toBeInTheDocument();
  });

  it("should render training description", () => {
    render(<TrainingCard training={mockTraining} />);

    expect(screen.getByText("Test training description")).toBeInTheDocument();
  });

  it("should display correct type label for challenge", () => {
    render(<TrainingCard training={mockTraining} />);

    expect(screen.getByText("チャレンジ")).toBeInTheDocument();
  });

  it("should display correct type label for skill", () => {
    const skillTraining: Training = {
      ...mockTraining,
      type: "skill",
    };

    render(<TrainingCard training={skillTraining} />);

    expect(screen.getByText("スキル")).toBeInTheDocument();
  });

  it("should render link to training detail page", () => {
    render(<TrainingCard training={mockTraining} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/training/test-training");
  });

  it("should display difficulty", () => {
    render(<TrainingCard training={mockTraining} />);

    expect(screen.getByText("normal")).toBeInTheDocument();
  });

  it("should display CTA button", () => {
    render(<TrainingCard training={mockTraining} />);

    expect(screen.getByText("トレーニングを見る")).toBeInTheDocument();
  });
});
