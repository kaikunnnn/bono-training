import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SectionHeading from "@/components/training/SectionHeading";

describe("SectionHeading", () => {
  it("should render title", () => {
    render(<SectionHeading title="Test Title" description="Test description" />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Test Title" })
    ).toBeInTheDocument();
  });

  it("should render description", () => {
    render(<SectionHeading title="Test Title" description="Test description" />);

    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("should render link when provided", () => {
    render(
      <SectionHeading
        title="Test Title"
        description="Test description"
        linkText="Learn more"
        linkHref="https://example.com"
      />
    );

    const link = screen.getByRole("link", { name: /learn more/i });
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("should not render link when not provided", () => {
    render(<SectionHeading title="Test Title" description="Test description" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <SectionHeading
        title="Test Title"
        description="Test description"
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
