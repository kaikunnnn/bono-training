import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContentWrapper from "@/components/training/ContentWrapper";

describe("ContentWrapper", () => {
  it("should render children", () => {
    render(
      <ContentWrapper>
        <div data-testid="child">Test Content</div>
      </ContentWrapper>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should apply width constraints by default", () => {
    render(
      <ContentWrapper>
        <div>Content</div>
      </ContentWrapper>
    );

    const wrapper = screen.getByText("Content").parentElement;
    expect(wrapper).toHaveClass("mx-auto");
    expect(wrapper).toHaveClass("max-w-[1120px]");
  });

  it("should render full width when fullWidth is true", () => {
    render(
      <ContentWrapper fullWidth>
        <div data-testid="content">Full Width Content</div>
      </ContentWrapper>
    );

    const wrapper = screen.getByTestId("content").parentElement;
    expect(wrapper).not.toHaveClass("mx-auto");
    expect(wrapper).not.toHaveClass("max-w-[1120px]");
  });

  it("should apply custom className", () => {
    render(
      <ContentWrapper className="custom-class">
        <div>Content</div>
      </ContentWrapper>
    );

    const wrapper = screen.getByText("Content").parentElement;
    expect(wrapper).toHaveClass("custom-class");
  });
});
