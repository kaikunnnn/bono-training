import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlogCard } from "@/components/blog/BlogCard";
import type { BlogPost } from "@/types/blog";

describe("BlogCard", () => {
  const mockPost: BlogPost = {
    id: "test-1",
    slug: "test-post",
    title: "Test Blog Post",
    description: "Test blog description",
    category: "デザイン",
    author: "Test Author",
    publishedAt: "2024-01-15T00:00:00Z",
    readingTime: 5,
    tags: ["design", "ui"],
    thumbnail: "https://example.com/image.jpg",
    featured: false,
    content: "Test content",
  };

  it("should render post title", () => {
    render(<BlogCard post={mockPost} />);

    expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
  });

  it("should render post description", () => {
    render(<BlogCard post={mockPost} />);

    expect(screen.getByText("Test blog description")).toBeInTheDocument();
  });

  it("should render category badge", () => {
    render(<BlogCard post={mockPost} />);

    expect(screen.getByText("デザイン")).toBeInTheDocument();
  });

  it("should render reading time", () => {
    render(<BlogCard post={mockPost} />);

    expect(screen.getByText("5分")).toBeInTheDocument();
  });

  it("should render link to blog detail page", () => {
    render(<BlogCard post={mockPost} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/blog/test-post");
  });

  it("should render featured badge when featured is true", () => {
    const featuredPost: BlogPost = {
      ...mockPost,
      featured: true,
    };

    render(<BlogCard post={featuredPost} />);

    expect(screen.getByText("おすすめ")).toBeInTheDocument();
  });

  it("should not render featured badge when featured is false", () => {
    render(<BlogCard post={mockPost} />);

    expect(screen.queryByText("おすすめ")).not.toBeInTheDocument();
  });
});
