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

  it("should remove a leading emoji from the title", () => {
    render(<BlogCard post={{ ...mockPost, title: "🎨 Test Blog Post" }} />);

    expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
    expect(screen.queryByText("🎨 Test Blog Post")).not.toBeInTheDocument();
  });

  it("should render category badge", () => {
    render(<BlogCard post={mockPost} />);

    expect(screen.getByText("デザイン")).toBeInTheDocument();
  });

  it("should render the publish date", () => {
    render(<BlogCard post={mockPost} />);

    expect(screen.getByText("2024年01月15日")).toBeInTheDocument();
  });

  it("should render link to blog detail page", () => {
    render(<BlogCard post={mockPost} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/blog/test-post");
  });

  it("should render the thumbnail", () => {
    render(<BlogCard post={mockPost} />);

    expect(screen.getByRole("img", { name: "emoji Image" })).toHaveAttribute(
      "src",
      mockPost.thumbnail
    );
  });

  it("should fall back to the category slug when category metadata is missing", () => {
    render(<BlogCard post={{ ...mockPost, category: "unknown" }} />);

    expect(screen.getByText("UNKNOWN")).toBeInTheDocument();
  });
});
