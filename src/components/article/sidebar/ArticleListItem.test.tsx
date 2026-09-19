import type { AnchorHTMLAttributes, ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ArticleListItem } from "./ArticleListItem";

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

describe("ArticleListItem prefetch policy", () => {
  const props = {
    title: "次の記事",
    isCompleted: false,
    href: "/contents/next",
  };

  it("does not prefetch every visible article and enables it on pointer intent", () => {
    render(<ArticleListItem {...props} />);
    const link = screen.getByRole("link", { name: /次の記事/ });
    expect(link.getAttribute("data-prefetch")).toBe("false");

    fireEvent.mouseEnter(link);
    expect(link.getAttribute("data-prefetch")).toBe("default");
  });

  it("enables prefetch for keyboard intent", () => {
    render(<ArticleListItem {...props} />);
    const link = screen.getByRole("link", { name: /次の記事/ });
    fireEvent.focus(link);
    expect(link.getAttribute("data-prefetch")).toBe("default");
  });

  it("never prefetches the active article", () => {
    render(<ArticleListItem {...props} isActive />);
    const link = screen.getByRole("link", { name: /次の記事/ });
    fireEvent.mouseEnter(link);
    expect(link.getAttribute("data-prefetch")).toBe("false");
  });
});
