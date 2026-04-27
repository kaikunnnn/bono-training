import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TrainingHero from "@/components/training/TrainingHero";

describe("TrainingHero", () => {
  it("should render the hero section", () => {
    render(<TrainingHero />);

    // aria-labelledby references the heading, so accessible name is the heading text
    expect(
      screen.getByRole("banner", { name: /トレーニング。それは"可能性"をひらく扉。/i })
    ).toBeInTheDocument();
  });

  it("should display the main heading", () => {
    render(<TrainingHero />);

    expect(
      screen.getByText(/トレーニング。それは"可能性"をひらく扉。/i)
    ).toBeInTheDocument();
  });

  it("should display the description text", () => {
    render(<TrainingHero />);

    expect(
      screen.getByText(
        /各コースで身につけたことをアウトプットするお題を並べています/i
      )
    ).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<TrainingHero />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveAttribute("id", "training-hero-title");
  });
});
