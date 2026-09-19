import type { AnchorHTMLAttributes, ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ArticleItem } from "./ArticleItem";

vi.mock("next/link", () => ({
  default: ({
    prefetch,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    prefetch?: boolean | null;
    children: ReactNode;
  }) => (
    <a
      {...props}
      data-prefetch={prefetch === null ? "default" : String(prefetch)}
    >
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: (props: { alt: string }) => <span role="img" aria-label={props.alt} />,
}));

describe("lesson ArticleItem prefetch policy", () => {
  const props = {
    articleNumber: 1,
    title: "次の記事",
    slug: "next-article",
    isCompleted: false,
  };

  it("waits for pointer intent before prefetching", () => {
    render(<ArticleItem {...props} />);
    const link = screen.getByRole("link", { name: /次の記事/ });
    expect(link.getAttribute("data-prefetch")).toBe("false");

    fireEvent.mouseEnter(link);
    expect(link.getAttribute("data-prefetch")).toBe("default");
  });

  it("supports keyboard intent", () => {
    render(<ArticleItem {...props} />);
    const link = screen.getByRole("link", { name: /次の記事/ });
    fireEvent.focus(link);
    expect(link.getAttribute("data-prefetch")).toBe("default");
  });
});
